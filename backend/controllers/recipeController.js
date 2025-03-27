const axios = require('axios');

exports.searchRecipes = async (req, res, next) => {
  try {
    const { ingredients, diet, sort } = req.query;

    if (!ingredients) {
      return res.status(400).json({
        success: false,
        error: 'Please provide ingredients'
      });
    }

    const params = {
      apiKey: process.env.SPOONACULAR_API_KEY,
      ingredients,
      number: 12,
      addRecipeNutrition: true
    };

    if (diet) params.diet = diet;
    if (sort) params.sort = sort;

    const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', { params });

    // Get nutrition details for each recipe
    const recipesWithNutrition = await Promise.all(
      response.data.map(async recipe => {
        const nutritionRes = await axios.get(
          `https://api.spoonacular.com/recipes/${recipe.id}/nutritionWidget.json`,
          {
            params: {
              apiKey: process.env.SPOONACULAR_API_KEY
            }
          }
        );
        
        return {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes || 30,
          servings: recipe.servings || 2,
          nutrition: {
            calories: nutritionRes.data.calories.replace('kcal', '').trim(),
            protein: nutritionRes.data.protein.replace('g', '').trim(),
            carbs: nutritionRes.data.carbs.replace('g', '').trim(),
            fat: nutritionRes.data.fat.replace('g', '').trim()
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      count: recipesWithNutrition.length,
      data: recipesWithNutrition
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};


exports.getRecipeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/information`,
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          includeNutrition: true
        }
      }
    );

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};