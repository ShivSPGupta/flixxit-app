const {
  searchMovieTitles,
  getMovieDetailWithTrailer,
  getMovieRow,
  getTrailerByTitle,
  getPosterStream,
} = require('../services/movieService');
const { createLogger } = require('../utils/logger');

const logger = createLogger('movies');

exports.searchMoviesHandler = async (req, res, next) => {
  try {
    const query = req.query.query || req.params.query;
    logger.debug('searchMoviesHandler:', { query });

    const data = await searchMovieTitles(query);
    res.json(data);
  } catch (error) {
    logger.debug('searchMoviesHandler error:', error.message);
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.getMovieDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.debug('getMovieDetail:', { id });

    const data = await getMovieDetailWithTrailer(id);
    logger.debug('getMovieDetail trailer lookup:', {
      id,
      title: data.Title,
      hasTrailerKey: Boolean(data.trailerKey),
    });

    res.json(data);
  } catch (error) {
    logger.debug('getMovieDetail error:', error.message);
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.getMoviesByRow = async (req, res, next) => {
  try {
    const { keyword } = req.params;
    const { page = 1 } = req.query;
    logger.debug('getMoviesByRow:', { keyword, page });

    const data = await getMovieRow(keyword, page);
    logger.debug('getMoviesByRow success:', {
      keyword,
      page,
      count: Array.isArray(data?.Search) ? data.Search.length : 0,
      response: data?.Response,
    });

    res.json(data);
  } catch (error) {
    logger.debug('getMoviesByRow error:', {
      keyword: req.params.keyword,
      page: req.query.page || 1,
      message: error.message,
    });
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.getTrailer = async (req, res, next) => {
  try {
    const { title } = req.params;
    logger.debug('getTrailer:', { title });

    const data = await getTrailerByTitle(title);
    res.json(data);
  } catch (error) {
    logger.debug('getTrailer error:', error.message);
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.getPoster = async (req, res, next) => {
  try {
    const posterPath = String(req.query.path || '');
    logger.debug('getPoster:', { posterPath });

    const { stream, contentType } = await getPosterStream(posterPath);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    stream.pipe(res);
  } catch (error) {
    logger.debug('getPoster error:', {
      message: error.message,
      status: error.statusCode || error.response?.status,
    });
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};
