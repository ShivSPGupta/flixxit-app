const axios = require('axios');
const TmdbCache = require('../models/TmdbCache');
const { createLogger } = require('./logger');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const API_KEY = process.env.TMDB_API_KEY;
const REQUEST_TIMEOUT = 15000;
const RETRY_COUNT = 1;
const RETRY_DELAY_MS = 300;
const SEARCH_TTL = 12 * 60 * 60 * 1000;
const DETAIL_TTL = 7 * 24 * 60 * 60 * 1000;
const TRENDING_TTL = 30 * 60 * 1000;
const ROW_TTL = 6 * 60 * 60 * 1000;
const logger = createLogger('tmdb');

const responseCache = new Map();
const inFlightRequests = new Map();

const debugLog = (...args) => logger.debug(...args);

const normalizeCacheKey = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const cacheGet = (key) => {
  const entry = responseCache.get(key);
  if (!entry) return undefined;

  if (entry.expiresAt < Date.now()) {
    responseCache.delete(key);
    return undefined;
  }

  return entry.value;
};

const cacheSet = (key, value, ttlMs) => {
  responseCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

const hasMovies = (value) => Array.isArray(value?.Search) && value.Search.length > 0;

const isUsableCachedValue = (key, value) => {
  if (key.startsWith('row:') || key.startsWith('search:')) {
    return hasMovies(value);
  }

  return value !== undefined && value !== null;
};

const dbCacheGet = async (key) => {
  debugLog('DB cache lookup start:', key);
  const entry = await TmdbCache.findOne({
    cacheKey: key,
    expiresAt: { $gt: new Date() },
  }).lean();

  debugLog(entry ? 'DB cache hit:' : 'DB cache miss:', key);
  return entry?.payload;
};

const dbCacheGetStale = async (key) => {
  const entry = await TmdbCache.findOne({ cacheKey: key }).lean();
  return entry?.payload;
};

const dbCacheSet = async (key, value, ttlMs) => {
  const expiresAt = new Date(Date.now() + ttlMs);
  debugLog('DB cache write:', key, 'expiresAt=', expiresAt.toISOString());

  await TmdbCache.updateOne(
    { cacheKey: key },
    {
      $set: {
        cacheKey: key,
        payload: value,
        expiresAt,
      },
    },
    { upsert: true }
  );
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableTmdbError = (error) => {
  const status = error.response?.status;
  return (
    isNetworkError(error) ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
};

const tmdbGet = async (path, params, label) => {
  let lastError;

  for (let attempt = 0; attempt <= RETRY_COUNT; attempt += 1) {
    try {
      debugLog(`TMDb upstream GET ${label}`, { attempt: attempt + 1, path, params });
      const response = await axios.get(`${TMDB_BASE_URL}${path}`, {
        timeout: REQUEST_TIMEOUT,
        params,
      });

      return response;
    } catch (error) {
      lastError = error;
      debugLog(`${label} error:`, error.response?.status, error.message, error.response?.data || '');

      if (attempt < RETRY_COUNT && isRetryableTmdbError(error)) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError;
};

const fetchWithCache = async (key, ttlMs, fetcher) => {
  const cached = cacheGet(key);
  if (isUsableCachedValue(key, cached)) {
    debugLog('Memory cache hit:', key);
    return cached;
  }

  if (inFlightRequests.has(key)) {
    debugLog('In-flight request reused:', key);
    return inFlightRequests.get(key);
  }

  let dbCached;
  try {
    dbCached = await dbCacheGet(key);
  } catch (error) {
    console.error('TMDb cache read error:', error.message);
  }

  if (isUsableCachedValue(key, dbCached)) {
    cacheSet(key, dbCached, ttlMs);
    return dbCached;
  }

  const requestPromise = (async () => {
    debugLog('Cache miss, fetching upstream:', key);
    try {
      const value = await fetcher();
      if (isUsableCachedValue(key, value)) {
        cacheSet(key, value, ttlMs);

        dbCacheSet(key, value, ttlMs).catch((error) => {
          console.error('TMDb cache write error:', error.message);
        });
      }

      return value;
    } catch (error) {
      if (isRetryableTmdbError(error)) {
        try {
          const staleValue = await dbCacheGetStale(key);
          if (isUsableCachedValue(key, staleValue)) {
            debugLog('Serving stale DB cache after upstream failure:', key);
            cacheSet(key, staleValue, Math.min(ttlMs, 5 * 60 * 1000));
            return staleValue;
          }
        } catch (staleError) {
          console.error('TMDb stale cache read error:', staleError.message);
        }
      }

      throw error;
    }
  })();

  inFlightRequests.set(key, requestPromise);

  try {
    return await requestPromise;
  } finally {
    inFlightRequests.delete(key);
  }
};

const buildImageUrl = (posterPath) => {
  if (!posterPath) return 'N/A';
  return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
};

const mapMovie = (movie) => ({
  imdbID: String(movie.id),
  Title: movie.title || movie.name || 'Untitled',
  Year: (movie.release_date || movie.first_air_date || '').slice(0, 4) || 'N/A',
  Poster: buildImageUrl(movie.poster_path),
  Plot: movie.overview || 'No plot available.',
});

const getSafeMovieResults = (results) => {
  if (!Array.isArray(results)) return [];
  return results.filter((movie) => movie && movie.id && movie.adult !== true);
};

const mapSearchResponse = (results) => {
  const safeResults = getSafeMovieResults(results);

  return {
    Search: safeResults.map(mapMovie),
    totalResults: String(safeResults.length),
    Response: safeResults.length > 0 ? 'True' : 'False',
    ...(safeResults.length === 0 ? { Error: 'No results found' } : {}),
  };
};

const mapCertification = (releaseDates) => {
  const usRelease = releaseDates?.results?.find((item) => item.iso_3166_1 === 'US');
  const certification = usRelease?.release_dates?.find((entry) => entry.certification)?.certification;
  return certification || 'N/A';
};

const mapCrewList = (crew, jobs) => {
  const names = crew
    .filter((person) => jobs.includes(person.job))
    .map((person) => person.name)
    .filter(Boolean);

  return [...new Set(names)].join(', ') || 'N/A';
};

const mapCastList = (cast) => {
  const names = cast.slice(0, 3).map((person) => person.name).filter(Boolean);
  return names.join(', ') || 'N/A';
};

const mapMovieDetail = (movie) => {
  const credits = movie.credits || {};
  const releaseDates = movie.release_dates || {};
  const crew = credits.crew || [];
  const cast = credits.cast || [];
  const genres = movie.genres || [];
  const spokenLanguages = movie.spoken_languages || [];
  const productionCountries = movie.production_countries || [];

  return {
    imdbID: String(movie.id),
    Title: movie.title || 'Untitled',
    Year: (movie.release_date || '').slice(0, 4) || 'N/A',
    Poster: buildImageUrl(movie.poster_path),
    Plot: movie.overview || 'No plot available.',
    imdbRating:
      typeof movie.vote_average === 'number' && movie.vote_average > 0
        ? movie.vote_average.toFixed(1)
        : 'N/A',
    Runtime: movie.runtime ? `${movie.runtime} min` : 'N/A',
    Rated: mapCertification(releaseDates),
    Released: movie.release_date || 'N/A',
    Director: crew.find((person) => person.job === 'Director')?.name || 'N/A',
    Writer: mapCrewList(crew, ['Writer', 'Screenplay', 'Story']),
    Actors: mapCastList(cast),
    Genre: genres.map((genre) => genre.name).join(', ') || 'N/A',
    Language: spokenLanguages.map((language) => language.english_name || language.name).join(', ') || 'N/A',
    Country: productionCountries.map((country) => country.name).join(', ') || 'N/A',
    BoxOffice: movie.revenue ? `$${movie.revenue.toLocaleString()}` : 'N/A',
    Awards: 'N/A',
  };
};

const mapSummaryToPartialDetail = (movie) => ({
  imdbID: String(movie.imdbID),
  Title: movie.Title || 'Untitled',
  Year: movie.Year || 'N/A',
  Poster: movie.Poster || 'N/A',
  Plot: movie.Plot || 'No plot available.',
  imdbRating: 'N/A',
  Runtime: 'N/A',
  Rated: 'N/A',
  Released: movie.Year || 'N/A',
  Director: 'N/A',
  Writer: 'N/A',
  Actors: 'N/A',
  Genre: 'N/A',
  Language: 'N/A',
  Country: 'N/A',
  BoxOffice: 'N/A',
  Awards: 'N/A',
  isPartialDetail: true,
});

const dbCacheFindMovieSummary = async (movieId) => {
  const entry = await TmdbCache.findOne({
    cacheKey: /^(row|search):/,
    'payload.Search.imdbID': String(movieId),
  })
    .sort({ updatedAt: -1 })
    .lean();

  return entry?.payload?.Search?.find((movie) => String(movie.imdbID) === String(movieId));
};

const ensureApiKey = () => {
  if (!API_KEY) {
    throw new Error('TMDB_API_KEY is missing');
  }
};

const isNetworkError = (error) => {
  return !error.response && ['EACCES', 'ENOTFOUND', 'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT'].includes(error.code);
};

const emptySearchResponse = (message = 'No results found') => ({
  Search: [],
  totalResults: '0',
  Response: 'False',
  Error: message,
});

exports.searchMovies = async (query) => {
  ensureApiKey();
  const normalizedQuery = normalizeCacheKey(query);
  const cacheKey = `search:${normalizedQuery}`;
  debugLog('searchMovies request:', { query, normalizedQuery, cacheKey });

  return fetchWithCache(cacheKey, SEARCH_TTL, async () => {
    try {
      const queryParts = normalizedQuery.split(' ').filter(Boolean);
      const fallbackQueries = queryParts.length > 1
        ? [normalizedQuery, queryParts[queryParts.length - 1], queryParts[0]]
        : [normalizedQuery];
      const searchQueries = [...new Set(fallbackQueries)];
      let lastError;

      for (const searchQuery of searchQueries) {
        try {
          const response = await tmdbGet('/search/movie', {
            api_key: API_KEY,
            query: searchQuery,
            include_adult: false,
          }, `/search/movie:${searchQuery}`);

          const mappedResponse = mapSearchResponse(response.data.results);
          if (hasMovies(mappedResponse) || searchQuery === searchQueries[searchQueries.length - 1]) {
            return mappedResponse;
          }

          debugLog('Search returned no results, trying fallback query:', searchQuery);
        } catch (error) {
          lastError = error;
          if (!isNetworkError(error) || searchQuery === searchQueries[searchQueries.length - 1]) {
            throw error;
          }

          debugLog('Search query failed, trying fallback query:', searchQuery, error.message);
        }
      }

      if (lastError) throw lastError;
      return emptySearchResponse();
    } catch (error) {
      if (isNetworkError(error)) {
        return emptySearchResponse('TMDb is temporarily unavailable');
      }

      throw new Error('TMDb API error: ' + error.message);
    }
  });
};

exports.getMovieDetails = async (movieId) => {
  ensureApiKey();
  const cacheKey = `detail:${movieId}`;
  debugLog('getMovieDetails request:', { movieId, cacheKey });

  try {
    return await fetchWithCache(cacheKey, DETAIL_TTL, async () => {
      try {
        const response = await tmdbGet(`/movie/${movieId}`, {
          api_key: API_KEY,
          append_to_response: 'credits,release_dates',
        }, '/movie/:id');

        return mapMovieDetail(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          return null;
        }

        if (isRetryableTmdbError(error)) {
          throw error;
        }

        throw new Error('TMDb API error: ' + error.message);
      }
    });
  } catch (error) {
    if (isRetryableTmdbError(error)) {
      try {
        const cachedSummary = await dbCacheFindMovieSummary(movieId);

        if (cachedSummary) {
          debugLog('Serving partial detail from cached row/search data:', movieId);
          return mapSummaryToPartialDetail(cachedSummary);
        }
      } catch (fallbackError) {
        console.error('TMDb partial detail fallback error:', fallbackError.message);
      }

      return null;
    }

    throw error;
  }
};

exports.getMoviesByKeyword = async (keyword, page = 1) => {
  ensureApiKey();
  const normalizedKeyword = normalizeCacheKey(keyword);
  const cacheKey = `row:${normalizedKeyword}:${page}`;
  debugLog('getMoviesByKeyword request:', { keyword, normalizedKeyword, page, cacheKey });

  const genreMap = {
    action: 28,
    comedy: 35,
    horror: 27,
    romance: 10749,
    'sci-fi': 878,
    documentary: 99,
    thriller: 53,
  };

  return fetchWithCache(cacheKey, normalizedKeyword === 'trending' ? TRENDING_TTL : ROW_TTL, async () => {
    try {
      let response;

      if (normalizedKeyword === 'trending') {
        try {
          response = await tmdbGet('/trending/movie/week', {
            api_key: API_KEY,
            page,
          }, '/trending/movie/week');

          if (!Array.isArray(response.data.results) || response.data.results.length === 0) {
            debugLog('Trending returned empty results, falling back to popular movies');
            response = await tmdbGet('/movie/popular', {
              api_key: API_KEY,
              page,
            }, '/movie/popular');
          }
        } catch (error) {
          debugLog('Trending request failed, falling back to popular movies:', error.message);
          response = await tmdbGet('/movie/popular', {
            api_key: API_KEY,
            page,
          }, '/movie/popular');
        }
      } else if (normalizedKeyword === 'marvel' || normalizedKeyword === 'batman') {
        response = await tmdbGet('/search/movie', {
          api_key: API_KEY,
          query: keyword,
          page,
          include_adult: false,
        }, '/search/movie (keyword preset)');
      } else if (genreMap[normalizedKeyword]) {
        response = await tmdbGet('/discover/movie', {
          api_key: API_KEY,
          page,
          sort_by: 'popularity.desc',
          vote_count_gte: 50,
          with_genres: genreMap[normalizedKeyword],
        }, '/discover/movie');
      } else {
        response = await tmdbGet('/search/movie', {
          api_key: API_KEY,
          query: keyword,
          page,
          include_adult: false,
        }, '/search/movie (fallback)');
      }

      return mapSearchResponse(response.data.results);
    } catch (error) {
      if (isNetworkError(error)) {
        return emptySearchResponse('TMDb is temporarily unavailable');
      }

      throw new Error('TMDb API error: ' + error.message);
    }
  });
};
