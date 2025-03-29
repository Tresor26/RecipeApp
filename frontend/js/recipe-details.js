document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    const recipeDetailsContainer = document.getElementById('recipe-details');
    
    if (!recipeId) {
        recipeDetailsContainer.innerHTML = '<div class="error">No recipe specified</div>';
        return;
    }
    
    loadRecipeDetails(recipeId);
    
    async function loadRecipeDetails(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/recipes/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(await response.text());
            }
            
            const { data: recipe } = await response.json();
            displayRecipeDetails(recipe);
        } catch (error) {
            console.error('Error loading recipe:', error);
            recipeDetailsContainer.innerHTML = `<div class="error">Failed to load recipe: ${error.message}</div>`;
        }
    }
    
    function displayRecipeDetails(recipe) {
        recipeDetailsContainer.innerHTML = `
            <div class="recipe-header">
                <h1>${recipe.title}</h1>
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image-large">
            </div>
            
            <div class="recipe-meta">
                <span><i class="fas fa-clock"></i> ${recipe.readyInMinutes} minutes</span>
                <span><i class="fas fa-utensils"></i> ${recipe.servings} servings</span>
            </div>
            
            <div class="recipe-content">
                <div class="recipe-section">
                    <h2>Ingredients</h2>
                    <ul class="ingredients-list">
                        ${recipe.extendedIngredients.map(ing => 
                            `<li>${ing.original}</li>`
                        ).join('')}
                    </ul>
                </div>
                
                <div class="recipe-section">
                    <h2>Instructions</h2>
                    ${recipe.instructions ? 
                        `<div class="instructions">${recipe.instructions}</div>` :
                        `<p>No instructions available.</p>`
                    }
                </div>
                
                <div class="recipe-section">
                    <h2>Nutrition Information</h2>
                    <div class="nutrition-facts">
                        ${recipe.nutrition.nutrients.slice(0, 10).map(nutrient => `
                            <div class="nutrient">
                                <span class="nutrient-name">${nutrient.name}</span>
                                <span class="nutrient-amount">${nutrient.amount} ${nutrient.unit}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'auth.html';
    });
});