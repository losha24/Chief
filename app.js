/** Chef-השף הצעיר v7.3.1 | Alexey Zavodisker **/

const initialRecipes = [
    {
        id: "r1", title: "שניצל קריספי", category: "בשרי", rating: "5", time: "30 דק'", servings: 4,
        img: "https://images.unsplash.com/photo-1594834712647-95b3279937dc?w=500",
        ingredients: ["חזה עוף פרוס", "קמח", "ביצים טרופות", "פירורי לחם", "מלח ופלפל"],
        instructions: ["טובלים בקמח", "מעבירים לביצה", "מצפים בפירורי לחם", "מטגנים בשמן חם עד הזהבה"]
    },
    {
        id: "r2", title: "פסטה רוזה", category: "פסטות", rating: "5", time: "20 דק'", servings: 2,
        img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500",
        ingredients: ["חבילת פסטה", "מכל שמנת לבישול", "רסק עגבניות", "שום כתוש", "בזיליקום"],
        instructions: ["מבשלים פסטה", "מטגנים שום", "מוסיפים רסק ושמנת", "מבשלים עד הסמכה ומערבבים"]
    },
    {
        id: "r3", title: "סלט קינואה עשיר", category: "סלטים", rating: "4", time: "25 דק'", servings: 3,
        img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
        ingredients: ["כוס קינואה מבושלת", "מלפפון חתוך", "עגבניות שרי", "פטרוזיליה", "לימון ושמן זית"],
        instructions: ["מערבבים את הקינואה עם הירקות", "מתבלים בלימון, מלח ושמן זית", "מגישים קר"]
    },
    {
        id: "r4", title: "סופלה שוקולד מהיר", category: "קינוחים", rating: "5", time: "15 דק'", servings: 1,
        img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500",
        ingredients: ["100 גרם שוקולד מריר", "50 גרם חמאה", "1 ביצה", "2 כפות סוכר", "1 כף קמח"],
        instructions: ["ממיסים שוקולד וחמאה", "מוסיפים ביצה וסוכר", "מקפלים קמח", "אופים 10 דקות ב-180 מעלות"]
    }
];

let recipes = JSON.parse(localStorage.getItem('chef_pro_v7')) || initialRecipes;
let shoppingList = JSON.parse(localStorage.getItem('shop_list_v7')) || [];
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
            document.getElementById('imgPreview').innerHTML = `<img src="${tempImageData}" style="width:40px;height:40px;border-radius:4px;margin-top:5px;">`;
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
        img: tempImageData || (id ? recipes.find(x => x.id == id).img : 'https://via.placeholder.com/150'),
        ingredients: ing.split('\n').filter(x => x.trim()),
        instructions: document.getElementById('editSteps').value.split('\n').filter(x => x.trim())
    };

    if (id) {
        const i = recipes.findIndex(x => x.id == id);
        recipes[i] = r;
    } else {
        recipes.push(r);
    }

    localStorage.setItem('chef_pro_v7', JSON.stringify(recipes));
    tempImageData = "";
    closeModal();
    renderGrid();
}

function renderGrid(data = recipes) {
    const grid = document.getElementById('recipeGrid');
    grid.innerHTML = data.map(r => `
        <div class="card">
            <img src="${r.img}" class="card-img" onclick="viewRecipe('${r.id}')">
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

function viewRecipe(id) {
    const r = recipes.find(x => x.id == id);
    const content = document.getElementById('viewAreaContent');
    content.innerHTML = `
        <img src="${r.img}" style="width:100%; border-radius:12px; margin-bottom:15px;">
        <h2>${r.title}</h2>
        <p><b>קטגוריה:</b> ${r.category} | <b>זמן:</b> ${r.time}</p>
        <h4>מצרכים:</h4>
        <ul class="view-list">${r.ingredients.map(i => `<li><button onclick="addToShop('${i}')">🛒</button> ${i}</li>`).join('')}</ul>
        <h4>הוראות:</h4>
        <p>${r.instructions.join('<br>')}</p>
    `;
    document.getElementById('recipeView').classList.remove('hidden');
}

function addToShop(item) {
    shoppingList.push(item);
    localStorage.setItem('shop_list_v7', JSON.stringify(shoppingList));
    alert('נוסף לקניות!');
}

function exportData() {
    const data = JSON.stringify({ recipes, shoppingList });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chef_backup.json`;
    a.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const imported = JSON.parse(e.target.result);
        if (imported.recipes) {
            recipes = imported.recipes;
            shoppingList = imported.shoppingList || [];
            localStorage.setItem('chef_pro_v7', JSON.stringify(recipes));
            localStorage.setItem('shop_list_v7', JSON.stringify(shoppingList));
            renderGrid();
            alert("שחזור הושלם!");
        }
    };
    reader.readAsText(file);
}

function handleSearch() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = recipes.filter(r => r.title.toLowerCase().includes(term) || r.category.toLowerCase().includes(term));
    renderGrid(filtered);
}

function deleteRecipe(id) {
    if(confirm('למחוק?')) {
        recipes = recipes.filter(r => r.id != id);
        localStorage.setItem('chef_pro_v7', JSON.stringify(recipes));
        renderGrid();
    }
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
        document.getElementById('editIng').value = r.ingredients.join('\n');
        document.getElementById('editSteps').value = r.instructions.join('\n');
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
    localStorage.setItem('shop_list_v7', JSON.stringify(shoppingList));
    toggleShoppingList();
}

function clearShoppingList() {
    shoppingList = [];
    localStorage.setItem('shop_list_v7', JSON.stringify(shoppingList));
    toggleShoppingList();
}

function resetFields() {
    document.querySelectorAll('input, textarea').forEach(i => i.value = '');
    document.getElementById('editRating').value = '5';
    document.getElementById('imgPreview').innerHTML = '';
}

function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }

window.onload = renderGrid;
