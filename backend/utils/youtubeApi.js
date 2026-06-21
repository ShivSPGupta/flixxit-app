const axios = require('axios');
const TrailerCache = require('../models/TrailerCache');

const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';
const API_KEY = process.env.YOUTUBE_API_KEY;
const REQUEST_TIMEOUT = 10000;
const MEMORY_POSITIVE_TTL = 7 * 24 * 60 * 60 * 1000;
const MEMORY_NEGATIVE_TTL = 10 * 60 * 1000;
const DB_TTL = 30 * 24 * 60 * 60 * 1000;

const trailerCache = new Map();
const inFlightRequests = new Map();

const cacheGet = (key) => {
  const entry = trailerCache.get(key);
  if (!entry) return undefined;

  if (entry.expiresAt < Date.now()) {
    trailerCache.delete(key);
    return undefined;
  }

  return entry.value;
};

const cacheSet = (key, value, ttlMs) => {
  trailerCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

const normalizeTitleKey = (movieTitle) =>
  String(movieTitle || '').toLowerCase().trim().replace(/\s+/g, ' ');

const isNetworkError = (error) => {
  return !error.response && ['EACCES', 'ENOTFOUND', 'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT'].includes(error.code);
};

const isQuotaOrServerError = (error) => {
  const status = error.response?.status;
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
};

exports.searchTrailer = async (movieTitle) => {
  const titleKey = normalizeTitleKey(movieTitle);
  if (!titleKey) return null;
  const cacheKey = `trailer:${titleKey}`;
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) return cached;

  const dbCached = await TrailerCache.findOne({
    titleKey,
    expiresAt: { $gt: new Date() },
  }).lean();

  if (dbCached?.trailerKey) {
    cacheSet(cacheKey, dbCached.trailerKey, MEMORY_POSITIVE_TTL);
    return dbCached.trailerKey;
  }

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const requestPromise = (async () => {
    try {
      const response = await axios.get(YOUTUBE_BASE_URL, {
        timeout: REQUEST_TIMEOUT,
        params: {
          key: API_KEY,
          q: `${movieTitle} trailer`,
          part: 'snippet',
          type: 'video',
          maxResults: 5,
          order: 'relevance',
          relevanceLanguage: 'en',
          regionCode: 'IN',
          safeSearch: 'none',
          videoEmbeddable: true,
        }
      });

      const items = response.data.items || [];
      const scoredCandidate = items
        .map((item) => {
          const title = String(item?.snippet?.title || '').toLowerCase();
          const score =
            (title.includes('official trailer') ? 3 : 0) +
            (title.includes('trailer') ? 2 : 0) +
            (title.includes('teaser') ? 1 : 0);

          return {
            videoId: item?.id?.videoId,
            score,
          };
        })
        .filter((item) => item.videoId)
        .sort((a, b) => b.score - a.score)[0];

      const trailerKey = scoredCandidate?.videoId || null;

      if (trailerKey) {
        const expiresAt = new Date(Date.now() + DB_TTL);
        await TrailerCache.findOneAndUpdate(
          { titleKey },
          {
            titleKey,
            movieTitle: String(movieTitle || '').trim(),
            trailerKey,
            expiresAt,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        cacheSet(cacheKey, trailerKey, MEMORY_POSITIVE_TTL);
      } else {
        cacheSet(cacheKey, null, MEMORY_NEGATIVE_TTL);
      }

      return trailerKey;
    } catch (error) {
      console.error('YouTube API error:', error.message);
      if (!isNetworkError(error) && !isQuotaOrServerError(error)) {
        cacheSet(cacheKey, null, MEMORY_NEGATIVE_TTL);
      }
      return null;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
};
