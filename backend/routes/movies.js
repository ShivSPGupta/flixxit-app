const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');
const {
  searchMoviesHandler,
  getMovieDetail,
  getMoviesByRow,
  getTrailer,
  getPoster
} = require('../controllers/moviesController');

router.get('/search', protect, apiLimiter, searchMoviesHandler);
router.get('/search/:query', protect, apiLimiter, searchMoviesHandler);
router.get('/detail/:id', protect, getMovieDetail);
router.get('/row/:keyword', protect, apiLimiter, getMoviesByRow);
router.get('/trailer/:title', protect, getTrailer);
router.get('/poster', getPoster);

module.exports = router;
