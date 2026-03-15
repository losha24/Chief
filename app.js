/** Chef-השף הצעיר v7.2.5 | Alexey Zavodisker **/

let recipes = JSON.parse(localStorage.getItem('chef_pro_v7')) || [];

function renderGrid(data = recipes) {
    const grid = document.getElementById('recipeGrid');
    grid.innerHTML = data.map(r => `
        <div class="card">
            <img src="${r.img}" class="card-img" onclick="viewRecipe('${r.id}')">
            <div class="card-content">
                <span class="tag">${r.category}</span>
                <h3>${r.title}</h3>
                <div style="font-size:0.8rem">⭐ ${r.rating}</div>
            </div>
            <div style="padding:8px; display:flex; justify-content:space-between">
                <button onclick="openModal('${r.id}')" style="border:none; background:none">✏️</button>
                <button onclick="deleteRecipe('${r.id}')" style="border:none; background:none; color:red">🗑️</button>
            </div>
        </div>
    `).join('');
}

function openModal(id = null) {
    resetFields();
    if (id) {
        const r = recipes.find(x => x.id == id);
        document.getElementById('editId').value = r.id;
        document.getElementById('editTitle').value = r.title;
        document.getElementById('editCat').value = r.category;
        document.getElementById('editRating').value = r.rating;
        document.getElementById('editTime').value = r.time;
        document.getElementById('editServings').value = r.servings;
        document.getElementById('editImg').value = r.img;
        document.getElementById('editIng').value = r.ingredients.join('\n');
        document.getElementById('editSteps').value = r.instructions.join('\n');
    }
    document.getElementById('editModal').classList.remove('hidden');
}

function saveRecipe() {
    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle').value;
    if(!title) return alert("שם מתכון חובה");

    const r = {
        id: id || Date.now().toString(),
        title: title,
        category: document.getElementById('editCat').value || 'כללי',
        rating: document.getElementById('editRating').value,
        time: document.getElementById('editTime').value,
        servings: document.getElementById('editServings').value || 1,
        img: document.getElementById('editImg').value || 'https://via.placeholder.com/150',
        ingredients: document.getElementById('editIng').value.split('\n'),
        instructions: document.getElementById('editSteps').value.split('\n')
    };

    if(id) {
        const i = recipes.findIndex(x => x.id == id);
        recipes[i] = r;
    } else {
        recipes.push(r);
    }

    localStorage.setItem('chef_pro_v7', JSON.stringify(recipes));
    closeModal();
    renderGrid();
}

function resetFields() {
    document.querySelectorAll('input, textarea').forEach(i => i.value = '');
    document.getElementById('editRating').value = '5';
}

function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }

window.onload = () => renderGrid();
