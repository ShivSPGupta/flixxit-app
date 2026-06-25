const axios = require('axios');
const { searchMovies, getMovieDetails, getMoviesByKeyword } = require('../utils/tmdbApi');
const { searchTrailer } = require('../utils/youtubeApi');

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const searchMovieTitles = async (query) => {
  return searchMovies(query);
};

const getMovieDetailWithTrailer = async (id) => {
  const movieData = await getMovieDetails(id);

  if (!movieData) {
    throw createHttpError('Movie service is temporarily unavailable. Please try again later.', 503);
  }

  const trailerKey = await searchTrailer(movieData.Title);

  return {
    ...movieData,
    trailerKey,
  };
};

const getMovieRow = async (keyword, page = 1) => {
  return getMoviesByKeyword(keyword, page);
};

const getTrailerByTitle = async (title) => {
  const trailerKey = await searchTrailer(title);

  if (!trailerKey) {
    throw createHttpError('Trailer not found', 404);
  }

  return { trailerKey };
};

const getPosterStream = async (posterPath) => {
  try {
    const response = await axios.get(`${TMDB_IMAGE_BASE_URL}${posterPath}`, {
      responseType: 'stream',
      timeout: 10000,
    });

    return {
      stream: response.data,
      contentType: response.headers['content-type'] || 'image/jpeg',
    };
  } catch (error) {
    if (error.response?.status) {
      throw createHttpError('Poster unavailable', error.response.status);
    }

    throw error;
  }
};

module.exports = {
  searchMovieTitles,
  getMovieDetailWithTrailer,
  getMovieRow,
  getTrailerByTitle,
  getPosterStream,
};
