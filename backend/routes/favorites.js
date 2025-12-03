const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  addToList,
  getList,
  removeFromList
} = require('../controllers/favoritesController');

router.post('/list', protect, addToList);
router.get('/list', protect, getList);
router.delete('/list/:imdbID', protect, removeFromList);

module.exports = router;