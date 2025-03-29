require('dotenv').config()
const express = require("express")
const cors = require("cors")
const axios = require("axios")
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const recipeRoutes = require('./routes/recipeRoutes');

const app = express()

const allowedOrigins = ["http://localhost:5500", "http://127.0.0.1:5500", "http://44.212.13.205:3000", "http://web01.tresorshingiro.tech", "https://web01.tresorshingiro.tech"];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use(express.json())

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/mealplan', mealPlanRoutes);
app.use('/api/recipes', recipeRoutes);

app.get('/api/recipes', async (req, res) => {
    const { query, diet, ingredients } = req.query;
    try {
        const response = await axios.get(
            `https://api.spoonacular.com/recipes/complexSearch`,
            {
                params: {
                    apiKey: process.env.SPOONACULAR_API_KEY,
                    query: query,
                    diet: diet,
                    includeIngredients: ingredients,
                    addRecipeNutrition: true,
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to fetch recipes' });
    }
});

app.get('/api/recipes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.get(
            `https://api.spoonacular.com/recipes/${id}/information`,
            {
                params: {
                    apiKey: process.env.SPOONACULAR_API_KEY,
                    includeNutrition: true,
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch recipe details' });
    }
});

mongoose.connect(process.env.MONGO_URI)
       .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('Connected to DB and Listening on port', process.env.PORT)
        })
       })
       .catch((error) => {
        console.log(error)
       })