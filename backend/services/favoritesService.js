const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const addMovieToList = async (user, movie) => {
  const alreadyAdded = user.savedMovies.some(
    (savedMovie) => savedMovie.imdbID === movie.imdbID
  );

  if (alreadyAdded) {
    throw createHttpError('Movie already in list');
  }

  user.savedMovies.push(movie);
  await user.save();

  return user.savedMovies;
};

const getSavedMovies = (user) => {
  return user.savedMovies;
};

const removeMovieFromList = async (user, imdbID) => {
  user.savedMovies = user.savedMovies.filter(
    (movie) => movie.imdbID !== imdbID
  );

  await user.save();

  return user.savedMovies;
};

module.exports = {
  addMovieToList,
  getSavedMovies,
  removeMovieFromList,
};
