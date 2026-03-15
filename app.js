/** * Chef Manager Pro - v7.2.3 
 * Stable Build by Alexey Zavodisker
 */

let recipes = JSON.parse(localStorage.getItem('chef_pro_v7')) || [];

// פונקציית עדכון ורענון
function checkForUpdate() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(reg => {
            if (reg) reg.update();
            alert("המערכת מתרעננת לשמירה על נתונים...");
            location.reload(true);
        });
    } else {
        location.reload(true);
    }
}

// שמירת מתכון
function saveRecipe() {
    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle').value.trim();
    
    if (!title) {
        alert("נא להזין כותרת למתכון");
        return;
    }

    const recipeObj = {
        id: id || Date.now().toString(),
        title: title,
        category: document.getElementById('editCat').value || 'כללי',
        rating: parseInt(document.getElementById('editRating').value),
        time: document.getElementById('editTime').value || '--',
        servings: document.getElementById('editServings').value || 1,
        img: document.getElementById('editImg').value || 'https://via.placeholder.com/400x200?text=No+Image',
        ingredients: document.getElementById('editIng').value.split('\n').filter(line => line.trim()),
        instructions: document.getElementById('editSteps').value.split('\n').filter(line => line.trim())
    };

    if (id) {
        const index = recipes.findIndex(r => r.id === id);
        if (index !== -1) recipes[index] = recipeObj;
    } else {
        recipes.push(recipeObj);
    }

    localStorage.setItem('chef_pro_v7', JSON.stringify(recipes));
    closeModal();
    renderGrid();
}

// פתיחת מודל (הוספה/עריכה)
function openModal(id = null) {
    // איפוס שדות לפני פתיחה
    document.getElementById('editId').value = '';
    document.getElementById('editTitle').value = '';
    document.getElementById('editCat').value = '';
    document.getElementById('editRating').value = '5';
    document.getElementById('editTime').value = '';
    document.getElementById('editServings').value = '';
    document.getElementById('editImg').value = '';
    document.getElementById('editIng').value = '';
    document.getElementById('editSteps').value = '';

    if (id) {
        const r = recipes.find(x => x.id == id);
        if (r) {
            document.getElementById('editId').value = r.id;
            document.getElementById('editTitle').value = r.title;
            document.getElementById('editCat').value = r.category;
            document.getElementById('editRating').value = r.rating;
            document.getElementById('editTime').value = r.time;
            document.getElementById('editServings').value = r.servings;
            document.getElementById('editImg').value = r.img;
            document.getElementById('editIng').value = r.ingredients.join('\n');
            document.getElementById('editSteps').value = r.instructions.join('\n');
            document.getElementById('modalHeaderTitle').innerText = "עריכת מתכון";
        }
    } else {
        document.getElementById('modalHeaderTitle').innerText = "מתכון חדש";
    }
    document.getElementById('editModal').classList.remove('hidden');
}

// הצגת המתכונים במסך
function renderGrid(filterData = recipes) {
    const grid = document.getElementById('recipeGrid');
    grid.innerHTML = `
        <div class="card add-card" onclick="openModal()">
            <div class="add-content">
                <span class="plus-icon">+</span>
                <p>הוסף מתכון</p>
            </div>
        </div>
    ` + filterData.map(r => `
        <div class="card">
            <div class="card-img-container" onclick="viewRecipe('${r.id}')">
                <img src="${r.img}" class="card-img" onerror="this.src='https://via.placeholder.com/400x200?text=Image+Error'">
                <span class="card-rating">${'⭐'.repeat(r.rating)}</span>
            </div>
            <div class="card-content">
                <span class="tag">${r.category}</span>
                <h3>${r.title}</h3>
                <p class="card-meta">⏳ ${r.time} | 👥 ${r.servings} מנות</p>
            </div>
            <div class="card-actions">
                <button onclick="openModal('${r.id}')" class="btn-icon">✏️</button>
                <button onclick="deleteRecipe('${r.id}')" class="btn-icon btn-del">🗑️</button>
            </div>
        </div>
    `).join('');
}

function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }

function deleteRecipe(id) {
    if(confirm('למחוק את המתכון לצמיתות?')) {
        recipes = recipes.filter(r => r.id != id);
        localStorage.setItem('chef_pro_v7', JSON.stringify(recipes));
        renderGrid();
    }
}

window.onload = renderGrid;
