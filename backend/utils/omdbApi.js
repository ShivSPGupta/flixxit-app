const axios = require('axios');

const OMDB_BASE_URL = 'http://www.omdbapi.com/';
const API_KEY = process.env.OMDB_API_KEY;

exports.searchMovies = async (query) => {
  try {
    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: API_KEY,
        s: query,
        type: 'movie'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('OMDb API error: ' + error.message);
  }
};

exports.getMovieDetails = async (imdbID) => {
  try {
    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: API_KEY,
        i: imdbID,
        plot: 'full'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('OMDb API error: ' + error.message);
  }
};

exports.getMoviesByKeyword = async (keyword, page = 1) => {
  try {
    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: API_KEY,
        s: keyword,
        type: 'movie',
        page
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('OMDb API error: ' + error.message);
  }
};