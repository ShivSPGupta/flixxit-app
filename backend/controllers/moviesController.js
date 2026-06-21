const { searchMovies, getMovieDetails, getMoviesByKeyword } = require('../utils/tmdbApi');
const { searchTrailer } = require('../utils/youtubeApi');

exports.searchMoviesHandler = async (req, res, next) => {
  try {
    const { query } = req.params;
    const data = await searchMovies(query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getMovieDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movieData = await getMovieDetails(id);

    if (!movieData) {
      return res.status(503).json({
        message: 'Movie service is temporarily unavailable. Please try again later.',
      });
    }

    // Get YouTube trailer
    const trailerKey = await searchTrailer(movieData.Title);
    
    res.json({
      ...movieData,
      trailerKey
    });
  } catch (error) {
    next(error);
  }
};

exports.getMoviesByRow = async (req, res, next) => {
  try {
    const { keyword } = req.params;
    const { page = 1 } = req.query;
    
    const data = await getMoviesByKeyword(keyword, page);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getTrailer = async (req, res, next) => {
  try {
    const { title } = req.params;
    const trailerKey = await searchTrailer(title);
    
    if (!trailerKey) {
      return res.status(404).json({ message: 'Trailer not found' });
    }
    
    res.json({ trailerKey });
  } catch (error) {
    next(error);
  }
};
