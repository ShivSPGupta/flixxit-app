const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const buildUserResponse = (user) => ({
  _id: user._id,
  email: user.email,
  displayName: user.displayName,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

const buildAuthResponse = (user) => ({
  ...buildUserResponse(user),
  token: generateToken(user._id),
  refreshToken: generateRefreshToken(user._id),
});

const registerUser = async ({ email, password, displayName }) => {
  const normalizedEmail = normalizeEmail(email);
  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    throw createHttpError('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    email: normalizedEmail,
    password: hashedPassword,
    displayName: String(displayName || '').trim() || 'Flixxit User',
  });

  return buildAuthResponse(user);
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw createHttpError('Invalid email or password', 401);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw createHttpError('Invalid email or password', 401);
  }

  return buildAuthResponse(user);
};

const refreshAuthToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw createHttpError('User not found', 401);
    }

    return {
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id),
      user: buildUserResponse(user),
    };
  } catch {
    throw createHttpError('Invalid refresh token', 401);
  }
};

const updateUserEmail = async (user, email) => {
  const normalizedEmail = normalizeEmail(email);
  const emailExists = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: user._id },
  });

  if (emailExists) {
    throw createHttpError('Email already in use');
  }

  user.email = normalizedEmail;
  await user.save();

  return buildUserResponse(user);
};

const updateUserPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createHttpError('User not found', 404);
  }

  const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordCorrect) {
    throw createHttpError('Current password is incorrect', 401);
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return { message: 'Password updated successfully' };
};

const updateUserProfile = async (user, { displayName, avatar }) => {
  if (displayName) user.displayName = displayName;
  if (avatar) user.avatar = avatar;

  await user.save();

  return buildUserResponse(user);
};

const deleteUserAccount = async (userId) => {
  await User.findByIdAndDelete(userId);
  return { message: 'Account deleted successfully' };
};

module.exports = {
  registerUser,
  loginUser,
  refreshAuthToken,
  updateUserEmail,
  updateUserPassword,
  updateUserProfile,
  deleteUserAccount,
};
