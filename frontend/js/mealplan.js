document.addEventListener('DOMContentLoaded', function() {

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }
    
    
    const mealPlanContainer = document.querySelector('.meal-plan');
    const refreshBtn = document.getElementById('refreshPlan');
    const targetCalories = document.getElementById('targetCalories');
    const targetProtein = document.getElementById('targetProtein');
    const targetCarbs = document.getElementById('targetCarbs');
    const targetFat = document.getElementById('targetFat');
    
    // Load user data and meal plan
    loadUserData();
    loadMealPlan();
    
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadMealPlan);
    }
    
    async function loadUserData() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.age && user.weight && user.height) {
    
                const bmr = calculateBMR(user);
                const dailyCalories = Math.round(bmr * 1.2);
                
                targetCalories.textContent = dailyCalories;
                targetProtein.textContent = `${Math.round(dailyCalories * 0.3 / 4)}g`;
                targetCarbs.textContent = `${Math.round(dailyCalories * 0.4 / 4)}g`;
                targetFat.textContent = `${Math.round(dailyCalories * 0.3 / 9)}g`;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
    
    function calculateBMR(user) {
        if (user.gender === 'male') {
            return 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age);
        } else {
            return 447.593 + (9.247 * user.weight) + (3.098 * user.height) - (4.330 * user.age);
        }
    }
    
    async function loadMealPlan() {
        try {
            mealPlanContainer.innerHTML = '<div class="loading">Loading meal plan...</div>';
            
            const response = await fetch('http://localhost:4000/api/mealplan', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(await response.text());
            }
            
            const { data } = await response.json();
            displayMealPlan(data);
        } catch (error) {
            console.error('Meal plan error:', error);
            mealPlanContainer.innerHTML = `<div class="error">Failed to load meal plan: ${error.message}</div>`;
        }
    }

    function displayMealPlan(mealPlanData) {
        if (mealPlanData.dailyTargets) {
            targetCalories.textContent = mealPlanData.dailyTargets.calories;
            targetProtein.textContent = `${mealPlanData.dailyTargets.protein}g`;
            targetCarbs.textContent = `${mealPlanData.dailyTargets.carbs}g`;
            targetFat.textContent = `${mealPlanData.dailyTargets.fat}g`;
        }
        
        
        mealPlanContainer.innerHTML = '';
        
        if (!mealPlanData.meals || !Array.isArray(mealPlanData.meals)) {
            mealPlanContainer.innerHTML = '<div class="error">No meals found in the plan</div>';
            return;
        }
        
        // Group meals by category (breakfast, lunch, dinner)
        const mealsByCategory = {};
        mealPlanData.meals.forEach(meal => {
            const category = meal.timeFrame || 'meal';
            if (!mealsByCategory[category]) {
                mealsByCategory[category] = [];
            }
            mealsByCategory[category].push(meal);
        });
        
        // Create meal cards for each category
        for (const [category, meals] of Object.entries(mealsByCategory)) {
            const mealCard = document.createElement('div');
            mealCard.className = 'meal-card';
            
            const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
            mealCard.innerHTML = `<h2>${categoryTitle}</h2>`;
            
            meals.forEach(meal => {
                const mealItem = document.createElement('div');
                mealItem.className = 'meal-item';
    
                const imageUrl = `https://spoonacular.com/recipeImages/${meal.id}-312x231.jpg`;
                
                mealItem.innerHTML = `
                    <div class="meal-image" style="background-image: url('${imageUrl}')"></div>
                    <div class="meal-info">
                        <h3>${meal.title || 'Unnamed Recipe'}</h3>
                        <div class="meal-nutrition">
                            <span><i class="fas fa-fire"></i> ${meal.nutrition?.calories || 'N/A'} cal</span>
                            <span><i class="fas fa-dumbbell"></i> ${meal.nutrition?.protein || 'N/A'}g protein</span>
                            <span><i class="fas fa-bread-slice"></i> ${meal.nutrition?.carbs || 'N/A'}g carbs</span>
                            <span><i class="fas fa-cheese"></i> ${meal.nutrition?.fat || 'N/A'}g fat</span>
                        </div>
                        <button class="btn-small view-recipe" data-id="${meal.id}">View Recipe</button>
                    </div>
                `;
                
                const imgDiv = mealItem.querySelector('.meal-image');
                const img = new Image();
                img.onload = function() {
                    imgDiv.style.backgroundImage = `url('${imageUrl}')`;
                };
                img.onerror = function() {
                    imgDiv.style.backgroundImage = 'url(https://via.placeholder.com/312x231?text=No+Image)';
                };
                img.src = imageUrl;
                
                mealCard.appendChild(mealItem);
            });
            
            mealPlanContainer.appendChild(mealCard);
        }
        
        document.querySelectorAll('.view-recipe').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const recipeId = this.getAttribute('data-id');
                viewRecipeDetails(recipeId);
            });
        });
    }
    
    function viewRecipeDetails(recipeId) {
        window.location.href = `recipe-details.html?id=${recipeId}`;
    }
    
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'auth.html';
    });
});