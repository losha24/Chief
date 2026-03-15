/** ChefPro v1.0.2 | Alexey Zavodisker **/

const initialRecipes = [
    { id: "1", title: "שניצל קריספי", category: "בשרי", rating: "5", time: "30 דק'", servings: 4, img: "https://images.unsplash.com/photo-1594834712647-95b3279937dc?w=400", ingredients: ["חזה עוף", "פירורי לחם", "ביצה"], instructions: ["מצפים ומטגנים"] },
    { id: "2", title: "פסטה רוזה", category: "פסטות", rating: "5", time: "20 דק'", servings: 2, img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400", ingredients: ["פסטה", "שמנת", "רסק"], instructions: ["מבשלים ומערבבים"] }
];

let recipes = JSON.parse(localStorage.getItem('chef_v1_0_2')) || initialRecipes;
let shoppingList = JSON.parse(localStorage.getItem('shop_v1_0_2')) || [];
let tempImageData = "";

function renderGrid(data = recipes) {
    const grid = document.getElementById('recipeGrid');
    if (!grid) return;
    grid.innerHTML = data.map(r => `
        <div class="card">
            <img src="${r.img}" class="card-img" onclick="viewRecipe('${r.id}')" onerror="this.src='https://via.placeholder.com/150'">
            <div class="card-content">
                <span class="tag">${r.category}</span>
                <h3>${r.title}</h3>
                <div class="stars">${'⭐'.repeat(r.rating)}</div>
            </div>
            <div class="card-actions">
                <button onclick="openModal('${r.id}')">✏️</button>
                <button onclick="deleteRecipe('${r.id}')" style="color:red">🗑️</button>
            </div>
        </div>
    `).join('');
}

function filterRecipes() {
    const s = document.getElementById('searchInput').value.toLowerCase();
    const c = document.getElementById('categoryFilter').value;
    const filtered = recipes.filter(r => r.title.toLowerCase().includes(s) && (c === 'הכל' || r.category === c));
    renderGrid(filtered);
}

function viewRecipe(id) {
    const r = recipes.find(x => x.id == id);
    const content = document.getElementById('viewAreaContent');
    content.innerHTML = `
        <img src="${r.img}" style="width:100%; border-radius:15px; margin-bottom:15px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2>${r.title}</h2>
            <button onclick="shareToWhatsApp('${r.id}')" style="background:#25D366; color:white; border:none; padding:8px 15px; border-radius:20px; font-weight:bold; cursor:pointer;">שתף 💬</button>
        </div>
        <p><b>קטגוריה:</b> ${r.category} | ⭐ ${r.rating}</p>
        <h4>מצרכים:</h4>
        <ul style="padding-right:20px;">${r.ingredients.map(i => `<li>${i} <button onclick="addToShop('${i.replace(/'/g,"")}')" style="border:none; background:none;">🛒</button></li>`).join('')}</ul>
        <h4>הוראות:</h4>
        <p>${r.instructions.join('<br>')}</p>
    `;
    document.getElementById('recipeView').classList.remove('hidden');
}

function shareToWhatsApp(id) {
    const r = recipes.find(x => x.id == id);
    const text = `*מתכון מתוך ChefPro:* %0A*${r.title}*%0A%0A*מצרכים:*%0A${r.ingredients.join('%0A')}%0A%0A*הוראות:*%0A${r.instructions.join('%0A')}`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            tempImageData = ev.target.result;
            document.getElementById('imgPreview').innerHTML = `<img src="${tempImageData}" style="width:50px; height:50px; border-radius:5px;">`;
        };
        reader.readAsDataURL(file);
    }
}

function saveRecipe() {
    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle').value.trim();
    const cat = document.getElementById('editCat').value;
    const ing = document.getElementById('editIng').value.trim();
    if (!title || !cat || !ing) return alert("מלא שדות חובה");

    const r = {
        id: id || Date.now().toString(),
        title: title, category: cat,
        rating: document.getElementById('editRating').value,
        img: tempImageData || (id ? recipes.find(x => x.id == id).img : 'https://via.placeholder.com/150'),
        ingredients: ing.split('\n').filter(x => x.trim()),
        instructions: document.getElementById('editSteps').value.split('\n').filter(x => x.trim())
    };

    if (id) { const i = recipes.findIndex(x => x.id == id); recipes[i] = r; }
    else { recipes.push(r); }

    localStorage.setItem('chef_v1_0_2', JSON.stringify(recipes));
    tempImageData = ""; closeModal(); renderGrid();
}

function addToShop(item) {
    shoppingList.push(item);
    localStorage.setItem('shop_v1_0_2', JSON.stringify(shoppingList));
    alert('נוסף לסל!');
}

function toggleShoppingList() {
    const list = document.getElementById('shoppingListItems');
    list.innerHTML = shoppingList.map((item, i) => `<li>${item} <button onclick="removeShopItem(${i})">✕</button></li>`).join('');
    document.getElementById('shoppingListModal').classList.remove('hidden');
}

function removeShopItem(i) {
    shoppingList.splice(i, 1);
    localStorage.setItem('shop_v1_0_2', JSON.stringify(shoppingList));
    toggleShoppingList();
}

function clearShoppingList() { shoppingList = []; localStorage.setItem('shop_v1_0_2', JSON.stringify([])); toggleShoppingList(); }

function exportData() {
    const blob = new Blob([JSON.stringify({recipes, shoppingList})], {type: 'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'chef_backup.json'; a.click();
}

function importData(e) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        const d = JSON.parse(ev.target.result);
        recipes = d.recipes; shoppingList = d.shoppingList;
        localStorage.setItem('chef_v1_0_2', JSON.stringify(recipes)); renderGrid();
    };
    reader.readAsText(e.target.files[0]);
}

function openModal(id = null) {
    resetFields();
    if (id) {
        const r = recipes.find(x => x.id == id);
        document.getElementById('editId').value = r.id;
        document.getElementById('editTitle').value = r.title;
        document.getElementById('editCat').value = r.category;
        document.getElementById('editIng').value = r.ingredients.join('\n');
        document.getElementById('editSteps').value = r.instructions.join('\n');
    }
    document.getElementById('editModal').classList.remove('hidden');
}

function deleteRecipe(id) { if(confirm('למחוק?')) { recipes = recipes.filter(r => r.id != id); localStorage.setItem('chef_v1_0_2', JSON.stringify(recipes)); renderGrid(); } }
function resetFields() { document.querySelectorAll('input, textarea').forEach(i => i.value = ''); document.getElementById('imgPreview').innerHTML = ''; tempImageData = ""; }
function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }
function silentUpdate() { location.reload(true); }

window.onload = renderGrid;
