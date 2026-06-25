const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');
const { validate, movieSchemas } = require('../middleware/validate');
const {
  searchMoviesHandler,
  getMovieDetail,
  getMoviesByRow,
  getTrailer,
  getPoster
} = require('../controllers/moviesController');

router.get('/search', protect, apiLimiter, validate(movieSchemas.searchQuery, 'query'), searchMoviesHandler);
router.get('/search/:query', protect, apiLimiter, validate(movieSchemas.searchParams, 'params'), searchMoviesHandler);
router.get('/detail/:id', protect, validate(movieSchemas.detailParams, 'params'), getMovieDetail);
router.get(
  '/row/:keyword',
  protect,
  apiLimiter,
  validate(movieSchemas.rowParams, 'params'),
  validate(movieSchemas.rowQuery, 'query'),
  getMoviesByRow
);
router.get('/trailer/:title', protect, validate(movieSchemas.trailerParams, 'params'), getTrailer);
router.get('/poster', validate(movieSchemas.posterQuery, 'query'), getPoster);

module.exports = router;
