const User = require('../models/userModel');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { age, height, weight, dietaryPreferences } = req.body;

    // Validate input
    if (age && (age < 10 || age > 120)) {
      return res.status(400).json({
        success: false,
        error: 'Age must be between 10 and 120'
      });
    }

    if (height && (height < 100 || height > 250)) {
      return res.status(400).json({
        success: false,
        error: 'Height must be between 100cm and 250cm'
      });
    }

    if (weight && (weight < 30 || weight > 300)) {
      return res.status(400).json({
        success: false,
        error: 'Weight must be between 30kg and 300kg'
      });
    }

    const validPreferences = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free'];
    if (dietaryPreferences) {
      for (const pref of dietaryPreferences) {
        if (!validPreferences.includes(pref)) {
          return res.status(400).json({
            success: false,
            error: `Invalid dietary preference: ${pref}`
          });
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        age,
        height,
        weight,
        dietaryPreferences
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};