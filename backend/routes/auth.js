const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const {
  register,
  login,
  refreshToken,
  updateEmail,
  updatePassword,
  updateProfile,
  deleteAccount,
  logout
} = require('../controllers/authController');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.put('/update-email', protect, updateEmail);
router.put('/update-password', protect, updatePassword);
router.put('/update-profile', protect, updateProfile);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;