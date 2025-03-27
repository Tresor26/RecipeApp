document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }
    
    const searchBtn = document.getElementById('searchRecipes');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchRecipes);
    }
    
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            document.getElementById('recipeModal').style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('recipeModal')) {
            document.getElementById('recipeModal').style.display = 'none';
        }
    });

    async function searchRecipes() {
        const ingredients = document.getElementById('ingredientsInput').value;
        const diet = document.getElementById('dietFilter').value;
        const sortBy = document.getElementById('sortBy').value;
        
        if (!ingredients) {
            alert('Please enter at least one ingredient');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:4000/api/recipes?ingredients=${ingredients}&diet=${diet}&sort=${sortBy}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to search recipes');
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                displayRecipes(result.data);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to search recipes: ' + error.message);
        }
    }

    function displayRecipes(recipes) {
        const resultsContainer = document.getElementById('recipeResults');
        
        resultsContainer.innerHTML = '';
        
        if (!Array.isArray(recipes) || recipes.length === 0) {
            resultsContainer.innerHTML = `
                <div class="placeholder">
                    <i class="fas fa-search"></i>
                    <p>No recipes found. Try different ingredients.</p>
                </div>
            `;
            return;
        }
        
        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            
            const safeRecipe = {
                id: recipe.id || 0,
                title: recipe.title || 'Untitled Recipe',
                image: recipe.image || 'https://via.placeholder.com/300x200?text=No+Image',
                readyInMinutes: recipe.readyInMinutes || 'N/A',
                servings: recipe.servings || 'N/A',
                nutrition: {
                    calories: recipe.nutrition?.calories || 'N/A',
                    protein: recipe.nutrition?.protein || 'N/A',
                    carbs: recipe.nutrition?.carbs || 'N/A',
                    fat: recipe.nutrition?.fat || 'N/A'
                }
            };
            
            recipeCard.innerHTML = `
                <div class="recipe-image" style="background-image: url('${safeRecipe.image}')"></div>
                <div class="recipe-content">
                    <h3 class="recipe-title">${safeRecipe.title}</h3>
                    <div class="recipe-meta">
                        <span>${safeRecipe.readyInMinutes} mins</span>
                        <span>${safeRecipe.servings} servings</span>
                    </div>
                    <div class="recipe-nutrition">
                        <div class="nutrition-item">
                            <span class="value">${safeRecipe.nutrition.calories}</span>
                            <span class="label">Calories</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="value">${safeRecipe.nutrition.protein}g</span>
                            <span class="label">Protein</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="value">${safeRecipe.nutrition.carbs}g</span>
                            <span class="label">Carbs</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="value">${safeRecipe.nutrition.fat}g</span>
                            <span class="label">Fat</span>
                        </div>
                    </div>
                    <a href="#" class="view-recipe" data-id="${safeRecipe.id}">View Recipe</a>
                </div>
            `;
            
            resultsContainer.appendChild(recipeCard);
        });
        
        document.querySelectorAll('.view-recipe').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const recipeId = btn.getAttribute('data-id');
                viewRecipeDetails(recipeId);
            });
        });
    }

    async function viewRecipeDetails(recipeId) {
        try {
            const modalContent = document.getElementById('modalContent');
            modalContent.innerHTML = '<div class="loading">Loading recipe details...</div>';
            
            const response = await fetch(`http://localhost:4000/api/recipes/${recipeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to load recipe details');
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                showRecipeModal(result.data);
            } else {
                throw new Error('Invalid recipe data format');
            }
        } catch (error) {
            console.error('Recipe details error:', error);
            
            const modalContent = document.getElementById('modalContent');
            modalContent.innerHTML = `
                <div class="error">
                    <p>Failed to load recipe details</p>
                    <p>${error.message}</p>
                    <button class="btn-small" onclick="viewRecipeDetails(${recipeId})">Try Again</button>
                </div>
            `;
        }
    }

    function showRecipeModal(recipe) {
        const modalContent = document.getElementById('modalContent');
        
        const safeRecipe = {
            title: recipe.title || 'Untitled Recipe',
            image: recipe.image || 'https://via.placeholder.com/500x300?text=No+Image',
            readyInMinutes: recipe.readyInMinutes || 'N/A',
            servings: recipe.servings || 'N/A',
            extendedIngredients: recipe.extendedIngredients || [],
            analyzedInstructions: recipe.analyzedInstructions || [],
            nutrition: recipe.nutrition || { nutrients: [] }
        };
        
        modalContent.innerHTML = `
            <h2>${safeRecipe.title}</h2>
            <div class="recipe-details">
                <div class="recipe-image-large" style="background-image: url('${safeRecipe.image}')"></div>
                <div class="recipe-info">
                    <p><strong>Ready in:</strong> ${safeRecipe.readyInMinutes} minutes</p>
                    <p><strong>Servings:</strong> ${safeRecipe.servings}</p>
                    
                    <h3>Ingredients</h3>
                    <ul class="ingredients-list">
                        ${safeRecipe.extendedIngredients.length > 0 
                            ? safeRecipe.extendedIngredients.map(ing => `<li>${ing.original || ing.name || 'Unknown ingredient'}</li>`).join('')
                            : '<li>No ingredients information available</li>'}
                    </ul>
                    
                    <h3>Instructions</h3>
                    ${safeRecipe.analyzedInstructions.length > 0 && safeRecipe.analyzedInstructions[0].steps
                        ? `<ol class="instructions-list">
                            ${safeRecipe.analyzedInstructions[0].steps.map(step => 
                                `<li>${step.step || 'No step description'}</li>`).join('')}
                           </ol>`
                        : '<p>No instructions available.</p>'}
                    
                    <h3>Nutrition Information</h3>
                    <div class="nutrition-details">
                        ${safeRecipe.nutrition.nutrients.slice(0, 10).map(nutrient => `
                            <div class="nutrient-item">
                                <span class="nutrient-name">${nutrient.name || 'Unknown'}</span>
                                <span class="nutrient-amount">${nutrient.amount || 'N/A'} ${nutrient.unit || ''}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('recipeModal').style.display = 'block';
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'auth.html';
        });
    }
});