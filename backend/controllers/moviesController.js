const { searchMovies, getMovieDetails, getMoviesByKeyword } = require('../utils/tmdbApi');
const { searchTrailer } = require('../utils/youtubeApi');
const { getRequestId } = require('../utils/requestContext');
const axios = require('axios');
const DEBUG_MOVIES = process.env.DEBUG_TMDB === 'true';

const debugLog = (...args) => {
  if (DEBUG_MOVIES) {
    console.log(`[MOVIES][${getRequestId()}]`, ...args);
  }
};

exports.searchMoviesHandler = async (req, res, next) => {
  try {
    const query = req.query.query || req.params.query;
    debugLog('searchMoviesHandler:', { query });
    const data = await searchMovies(query);
    res.json(data);
  } catch (error) {
    debugLog('searchMoviesHandler error:', error.message);
    next(error);
  }
};

exports.getMovieDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    debugLog('getMovieDetail:', { id });
    const movieData = await getMovieDetails(id);

    if (!movieData) {
      debugLog('getMovieDetail unavailable:', { id });
      return res.status(503).json({
        message: 'Movie service is temporarily unavailable. Please try again later.',
      });
    }

    // Get YouTube trailer
    const trailerKey = await searchTrailer(movieData.Title);
    debugLog('getMovieDetail trailer lookup:', {
      id,
      title: movieData.Title,
      hasTrailerKey: Boolean(trailerKey),
    });
    
    res.json({
      ...movieData,
      trailerKey
    });
  } catch (error) {
    debugLog('getMovieDetail error:', error.message);
    next(error);
  }
};

exports.getMoviesByRow = async (req, res, next) => {
  try {
    const { keyword } = req.params;
    const { page = 1 } = req.query;
    debugLog('getMoviesByRow:', { keyword, page });
    
    const data = await getMoviesByKeyword(keyword, page);
    debugLog('getMoviesByRow success:', {
      keyword,
      page,
      count: Array.isArray(data?.Search) ? data.Search.length : 0,
      response: data?.Response,
    });
    res.json(data);
  } catch (error) {
    debugLog('getMoviesByRow error:', {
      keyword: req.params.keyword,
      page: req.query.page || 1,
      message: error.message,
    });
    next(error);
  }
};

exports.getTrailer = async (req, res, next) => {
  try {
    const { title } = req.params;
    debugLog('getTrailer:', { title });
    const trailerKey = await searchTrailer(title);
    
    if (!trailerKey) {
      debugLog('getTrailer not found:', { title });
      return res.status(404).json({ message: 'Trailer not found' });
    }
    
    res.json({ trailerKey });
  } catch (error) {
    debugLog('getTrailer error:', error.message);
    next(error);
  }
};

exports.getPoster = async (req, res, next) => {
  try {
    const posterPath = String(req.query.path || '');
    debugLog('getPoster:', { posterPath });

    if (!posterPath || !posterPath.startsWith('/')) {
      return res.status(400).json({ message: 'Invalid poster path' });
    }

    const response = await axios.get(`https://image.tmdb.org/t/p/w500${posterPath}`, {
      responseType: 'stream',
      timeout: 10000,
    });

    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    response.data.pipe(res);
  } catch (error) {
    debugLog('getPoster error:', {
      message: error.message,
      status: error.response?.status,
    });

    if (error.response?.status) {
      return res.status(error.response.status).json({
        message: 'Poster unavailable',
      });
    }

    next(error);
  }
};
