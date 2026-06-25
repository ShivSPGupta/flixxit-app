const {
  registerUser,
  loginUser,
  refreshAuthToken,
  updateUserEmail,
  updateUserPassword,
  updateUserProfile,
  deleteUserAccount,
} = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const authData = await registerUser(req.body);
    res.status(201).json(authData);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const authData = await loginUser(req.body);
    res.json(authData);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const tokenData = await refreshAuthToken(req.body.refreshToken);
    res.json(tokenData);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.updateEmail = async (req, res, next) => {
  try {
    const userData = await updateUserEmail(req.user, req.body.email);
    res.json(userData);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const result = await updateUserPassword(req.user._id, req.body);
    res.json(result);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userData = await updateUserProfile(req.user, req.body);
    res.json(userData);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const result = await deleteUserAccount(req.user._id);
    res.json(result);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
