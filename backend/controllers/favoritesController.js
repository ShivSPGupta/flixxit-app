exports.addToList = async (req, res, next) => {
  try {
    const { imdbID, title, poster } = req.body;

    const alreadyAdded = req.user.savedMovies.some(
      movie => movie.imdbID === imdbID
    );

    if (alreadyAdded) {
      return res.status(400).json({ message: 'Movie already in list' });
    }

    req.user.savedMovies.push({ imdbID, title, poster });
    await req.user.save();

    res.json(req.user.savedMovies);
  } catch (error) {
    next(error);
  }
};

exports.getList = async (req, res, next) => {
  try {
    res.json(req.user.savedMovies);
  } catch (error) {
    next(error);
  }
};

exports.removeFromList = async (req, res, next) => {
  try {
    const { imdbID } = req.params;

    req.user.savedMovies = req.user.savedMovies.filter(
      movie => movie.imdbID !== imdbID
    );
    
    await req.user.save();
    res.json(req.user.savedMovies);
  } catch (error) {
    next(error);
  }
};