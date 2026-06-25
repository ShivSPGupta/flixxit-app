const {
  addMovieToList,
  getSavedMovies,
  removeMovieFromList,
} = require('../services/favoritesService');

exports.addToList = async (req, res, next) => {
  try {
    const savedMovies = await addMovieToList(req.user, req.body);
    res.json(savedMovies);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.getList = async (req, res, next) => {
  try {
    res.json(getSavedMovies(req.user));
  } catch (error) {
    next(error);
  }
};

exports.removeFromList = async (req, res, next) => {
  try {
    const savedMovies = await removeMovieFromList(req.user, req.params.imdbID);
    res.json(savedMovies);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};
