const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { validate, authSchemas } = require('../middleware/validate');
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

router.post('/register', authLimiter, validate(authSchemas.register), register);
router.post('/login', authLimiter, validate(authSchemas.login), login);
router.post('/refresh', validate(authSchemas.refresh), refreshToken);
router.post('/logout', protect, logout);
router.put('/update-email', protect, validate(authSchemas.updateEmail), updateEmail);
router.put('/update-password', protect, validate(authSchemas.updatePassword), updatePassword);
router.put('/update-profile', protect, validate(authSchemas.updateProfile), updateProfile);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
