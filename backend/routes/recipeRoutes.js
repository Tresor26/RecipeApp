const express = require('express');
const { protect } = require('../middleware/auth');
const { searchRecipes, getRecipeDetails } = require('../controllers/recipeController');

const router = express.Router();

router.route('/')
  .get(protect, searchRecipes);

router.route('/:id')
  .get(protect, getRecipeDetails);

module.exports = router;