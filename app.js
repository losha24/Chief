/** Chef-השף הצעיר v1.0.0 | Alexey Zavodisker **/

const initialRecipes = [
    {
        id: "r1", title: "שניצל קריספי", category: "בשרי", rating: "5", time: "30 דק'", servings: 4,
        img: "https://images.unsplash.com/photo-1594834712647-95b3279937dc?w=500",
        ingredients: ["חזה עוף פרוס", "קמח", "ביצים", "פירורי לחם", "מלח"],
        instructions: ["טובלים בקמח", "מעבירים לביצה", "מצפים בפירורי לחם", "מטגנים"]
    },
    {
        id: "r2", title: "פסטה רוזה", category: "פסטות", rating: "5", time: "20 דק'", servings: 2,
        img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500",
        ingredients: ["פסטה", "שמנת לבישול", "רסק עגבניות", "שום"],
        instructions: ["מבשלים פסטה", "מכינים רוטב משמנת ורסק", "מערבבים"]
    },
    {
        id: "r3", title: "סלט קינואה", category: "סלטים", rating: "4", time: "25 דק'", servings: 3,
        img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
        ingredients: ["קינואה מבושלת", "ירקות חתוכים", "לימון", "שמן זית"],
        instructions: ["מערבבים הכל בקערה", "מתבלים ומגישים"]
    },
    {
        id: "r4", title: "סופלה שוקולד", category: "קינוחים", rating: "5", time: "15 דק'", servings: 1,
        img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500",
        ingredients: ["שוקולד מריר", "חמאה", "ביצה", "קמח"],
        instructions: ["ממיסים שוקולד וחמאה", "מוסיפים ביצה וקמח", "אופים 10 דקות"]
    }
];

let recipes = JSON.parse(localStorage.getItem('chef_pro_v1')) || initialRecipes;
let shoppingList = JSON.parse(localStorage.getItem('shop_list_v1')) || [];
let tempImageData = "";

function silentUpdate() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(reg => { if (reg) reg.update(); location.reload(true); });
    } else { location.reload(true); }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            tempImageData = e.target.result;
            document.getElementById('imgPreview').innerHTML = `<img src="${tempImageData}" style="width:50px;height:50px;border-radius:5px;margin-top:5px;">`;
        };
        reader.readAsDataURL(file);
    }
}

function saveRecipe() {
    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle').value.trim();
    const cat = document.getElementById('editCat').value;
    const ing = document.getElementById('editIng').value.trim();

    if (!title || !cat || !ing) return alert("נא למלא שם, קטגוריה ומצרכים");

    const r = {
        id: id || Date.now().toString(),
        title: title,
        category: cat,
        rating: document.getElementById('editRating').value,
        time: document.getElementById('editTime').value || '--',
        servings: document.getElementById('editServings').value || 1,
        img: tempImageData || (id ? (recipes.find(x => x.id == id)?.img || '') : 'https://via.placeholder.com/150'),
        ingredients: ing.split('\n').filter(x => x.trim()),
        instructions: document.getElementById('editSteps').value.split('\n').filter(x => x.trim())
    };

    if (id) {
        const i = recipes.findIndex(x => x.id == id);
        if (i !== -1) recipes[i] = r;
    } else {
        recipes.push(r);
    }

    localStorage.setItem('chef_pro_v1', JSON.stringify(recipes));
    tempImageData = "";
    closeModal();
    renderGrid();
}

function renderGrid(data = recipes) {
    const grid = document.getElementById('recipeGrid');
    if (!grid) return;
    grid.innerHTML = data.map(r => `
        <div class="card">
            <img src="${r.img}" class="card-img" onclick="viewRecipe('${r.id}')">
            <div class="card-content">
                <span class="tag">${r.category}</span>
                <h3>${r.title}</h3>
                <div>${'⭐'.repeat(r.rating)}</div>
            </div>
            <div class="card-actions">
                <button onclick="openModal('${r.id}')">✏️</button>
                <button onclick="deleteRecipe('${r.id}')" style="color:red">🗑️</button>
            </div>
        </div>
    `).join('');
}

function viewRecipe(id) {
    const r = recipes.find(x => x.id == id);
    if (!r) return;
    const content = document.getElementById('viewAreaContent');
    content.innerHTML = `
        <img src="${r.img}" style="width:100%; border-radius:12px; margin-bottom:15px;">
        <h2>${r.title}</h2>
        <p>⏱️ ${r.time} | 🍽️ ${r.servings} מנות</p>
        <h4>מצרכים:</h4>
        <ul style="padding-right:20px;">${r.ingredients.map(i => `<li>${i} <button onclick="addToShop('${i.replace(/'/g, "\\'")}')" style="border:none;background:none;cursor:pointer;">🛒</button></li>`).join('')}</ul>
        <h4>הוראות:</h4>
        <p>${r.instructions.join('<br>')}</p>
    `;
    document.getElementById('recipeView').classList.remove('hidden');
}

function addToShop(item) {
    shoppingList.push(item);
    localStorage.setItem('shop_list_v1', JSON.stringify(shoppingList));
    alert('התווסף לרשימת הקניות!');
}

function exportData() {
    const data = JSON.stringify({ recipes, shoppingList });
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'chef_backup_v1.json';
    a.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const d = JSON.parse(e.target.result);
        recipes = d.recipes || [];
        shoppingList = d.shoppingList || [];
        localStorage.setItem('chef_pro_v1', JSON.stringify(recipes));
        renderGrid();
        alert("שחזור הושלם!");
    };
    reader.readAsText(file);
}

function handleSearch() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = recipes.filter(r => r.title.toLowerCase().includes(term) || r.category.toLowerCase().includes(term));
    renderGrid(filtered);
}

function openModal(id = null) {
    resetFields();
    if (id) {
        const r = recipes.find(x => x.id == id);
        if (r) {
            document.getElementById('editId').value = r.id;
            document.getElementById('editTitle').value = r.title;
            document.getElementById('editCat').value = r.category;
            document.getElementById('editRating').value = r.rating;
            document.getElementById('editTime').value = r.time;
            document.getElementById('editServings').value = r.servings;
            document.getElementById('editIng').value = r.ingredients.join('\n');
            document.getElementById('editSteps').value = r.instructions.join('\n');
        }
    }
    document.getElementById('editModal').classList.remove('hidden');
}

function toggleShoppingList() {
    const list = document.getElementById('shoppingListItems');
    list.innerHTML = shoppingList.map((item, i) => `<li>${item} <button onclick="removeShopItem(${i})">✕</button></li>`).join('');
    document.getElementById('shoppingListModal').classList.remove('hidden');
}

function removeShopItem(i) {
    shoppingList.splice(i, 1);
    localStorage.setItem('shop_list_v1', JSON.stringify(shoppingList));
    toggleShoppingList();
}

function clearShoppingList() {
    shoppingList = [];
    localStorage.setItem('shop_list_v1', JSON.stringify(shoppingList));
    toggleShoppingList();
}

function deleteRecipe(id) {
    if (confirm('למחוק?')) {
        recipes = recipes.filter(x => x.id != id);
        localStorage.setItem('chef_pro_v1', JSON.stringify(recipes));
        renderGrid();
    }
}

function resetFields() {
    document.querySelectorAll('input, textarea').forEach(i => i.value = '');
    document.getElementById('editRating').value = '5';
    document.getElementById('editId').value = '';
    document.getElementById('imgPreview').innerHTML = '';
    tempImageData = "";
}

function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }

window.onload = renderGrid;
