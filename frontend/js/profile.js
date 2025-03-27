document.addEventListener('DOMContentLoaded', function() {

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }
    

    const profileForm = document.getElementById('profileForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    async function loadUserProfile() {
        try {
            const response = await fetch('http://localhost:4000/api/profile', {
                method: 'GET',
                headers: {
                    'Content-Type':'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to load profile');
            
            const { data: user } = await response.json();
            
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userEmail').textContent = user.email;
            
            // Set avatar initials
            const avatar = document.querySelector('.avatar');
            avatar.textContent = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            
            if (user.age) document.getElementById('age').value = user.age;
            if (user.height) document.getElementById('height').value = user.height;
            if (user.weight) document.getElementById('weight').value = user.weight;
            
            // Populate dietary preferences
            if (user.dietaryPreferences) {
                user.dietaryPreferences.forEach(pref => {
                    const checkbox = document.querySelector(`input[name="diet"][value="${pref}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        } catch (error) {
            console.error(error);
            alert('Failed to load profile data');
        }
    }
    
    // Handle form submission
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const age = document.getElementById('age').value;
        const height = document.getElementById('height').value;
        const weight = document.getElementById('weight').value;
        
        const dietCheckboxes = document.querySelectorAll('input[name="diet"]:checked');
        const dietaryPreferences = Array.from(dietCheckboxes).map(cb => cb.value);
        
        try {
            const response = await fetch('http://localhost:4000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    age,
                    height,
                    weight,
                    dietaryPreferences
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }
            
            const { data: updatedUser } = await response.json();
            alert('Profile updated successfully!');
    
            document.querySelectorAll('input[name="diet"]').forEach(checkbox => {
                checkbox.checked = updatedUser.dietaryPreferences.includes(checkbox.value);
            });
            
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });
    
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'auth.html';
    });
    
    loadUserProfile();
});