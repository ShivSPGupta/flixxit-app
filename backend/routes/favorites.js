const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validate, favoriteSchemas } = require('../middleware/validate');
const {
  addToList,
  getList,
  removeFromList
} = require('../controllers/favoritesController');

router.post('/list', protect, validate(favoriteSchemas.addToList), addToList);
router.get('/list', protect, getList);
router.delete('/list/:imdbID', protect, validate(favoriteSchemas.removeFromList, 'params'), removeFromList);

module.exports = router;
