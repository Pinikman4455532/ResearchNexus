const express = require('express');
const router = express.Router();
const { getFavorites, toggleFavorite } = require('../controllers/favoritesController');

router.get('/:userEmail', getFavorites);
router.post('/toggle', toggleFavorite);

module.exports = router;
