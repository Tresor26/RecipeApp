const axios = require('axios');
const User = require('../models/userModel');

exports.getMealPlan = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Calculate daily calorie needs
    let bmr;
    if (user.age && user.weight && user.height) {
      if (user.gender === 'male') {
        bmr = 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age);
      } else {
        bmr = 447.593 + (9.247 * user.weight) + (3.098 * user.height) - (4.330 * user.age);
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Please complete your profile with age, weight, and height'
      });
    }

    const activityLevel = 1.2; 
    const dailyCalories = Math.round(bmr * activityLevel);

    const proteinGrams = Math.round((dailyCalories * 0.3) / 4);
    const carbsGrams = Math.round((dailyCalories * 0.4) / 4);
    const fatGrams = Math.round((dailyCalories * 0.3) / 9);

    const params = {
      apiKey: process.env.SPOONACULAR_API_KEY,
      timeFrame: 'day',
      targetCalories: dailyCalories,
      diet: user.dietaryPreferences?.join(','),
      exclude: 'alcohol' 
    };

    const response = await axios.get('https://api.spoonacular.com/mealplanner/generate', { params });

    const mealsWithNutrition = await Promise.all(
      response.data.meals.map(async meal => {
        try {
          const nutritionRes = await axios.get(
            `https://api.spoonacular.com/recipes/${meal.id}/nutritionWidget.json`,
            {
              params: {
                apiKey: process.env.SPOONACULAR_API_KEY
              }
            }
          );
          
          return {
            ...meal,
            nutrition: nutritionRes.data
          };
        } catch (error) {
          console.error(`Failed to get nutrition for recipe ${meal.id}:`, error);
          return meal;
        }
      })
    );

    res.status(200).json({
      success: true,
      data: {
        meals: mealsWithNutrition,
        nutrients: response.data.nutrients,
        dailyTargets: {
          calories: dailyCalories,
          protein: proteinGrams,
          carbs: carbsGrams,
          fat: fatGrams
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};