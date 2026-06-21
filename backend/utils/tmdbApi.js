const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const API_KEY = process.env.TMDB_API_KEY;

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

const mapSearchResponse = (results) => ({
  Search: Array.isArray(results) ? results.map(mapMovie) : [],
  totalResults: String(Array.isArray(results) ? results.length : 0),
  Response: 'True',
});

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

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: API_KEY,
        query,
        include_adult: false,
      },
    });

    return mapSearchResponse(response.data.results);
  } catch (error) {
    if (isNetworkError(error)) {
      return emptySearchResponse('TMDb is temporarily unavailable');
    }

    throw new Error('TMDb API error: ' + error.message);
  }
};

exports.getMovieDetails = async (movieId) => {
  ensureApiKey();

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: API_KEY,
        append_to_response: 'credits,release_dates',
      },
    });

    return mapMovieDetail(response.data);
  } catch (error) {
    if (isNetworkError(error)) {
      return null;
    }

    throw new Error('TMDb API error: ' + error.message);
  }
};

exports.getMoviesByKeyword = async (keyword, page = 1) => {
  ensureApiKey();

  const normalizedKeyword = String(keyword || '').toLowerCase();
  const genreMap = {
    action: 28,
    comedy: 35,
    horror: 27,
    romance: 10749,
    'sci-fi': 878,
    documentary: 99,
    thriller: 53,
  };

  try {
    let response;

    if (normalizedKeyword === 'trending') {
      response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
        params: { api_key: API_KEY, page },
      });
    } else if (normalizedKeyword === 'marvel' || normalizedKeyword === 'batman') {
      response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: API_KEY,
          query: keyword,
          page,
          include_adult: false,
        },
      });
    } else if (genreMap[normalizedKeyword]) {
      response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
        params: {
          api_key: API_KEY,
          page,
          sort_by: 'popularity.desc',
          vote_count_gte: 50,
          with_genres: genreMap[normalizedKeyword],
        },
      });
    } else {
      response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: API_KEY,
          query: keyword,
          page,
          include_adult: false,
        },
      });
    }

    return mapSearchResponse(response.data.results);
  } catch (error) {
    if (isNetworkError(error)) {
      return emptySearchResponse('TMDb is temporarily unavailable');
    }

    throw new Error('TMDb API error: ' + error.message);
  }
};
