const express = require('express');
const { protect } = require('../middleware/auth');
const { getMealPlan } = require('../controllers/mealPlanController');

const router = express.Router();

router.route('/')
  .get(protect, getMealPlan);

module.exports = router;