const DB_NAME = 'chef_v220_data';
const SHOP_NAME = 'chef_v220_shop';

// מתכונים ראשוניים ריקים כדי לאפשר הוספת תמונות מהרגע הראשון
const initialRecipes = [];

let recipes = JSON.parse(localStorage.getItem(DB_NAME)) || initialRecipes;
let shoppingList = JSON.parse(localStorage.getItem(SHOP_NAME)) || [];
let deferredPrompt;

function updateApp() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            for (let r of regs) r.unregister();
            window.location.reload(true);
        });
    } else { window.location.reload(true); }
}

function filterRecipes() {
    const s = document.getElementById('searchInput').value.toLowerCase();
    const c = document.getElementById('categoryFilter').value;
    const strip = document.getElementById('titleStrip');
    
    // שינוי צבע הפס לפי קטגוריה
    const colors = {
        "בשרי": "#f8d7da",
        "חלבי": "#fff3cd",
        "מאפים": "#e2e3e5",
        "קינוחים": "#f3e5f5",
        "סלטים": "#d4edda",
        "פסטות": "#fff3cd",
        "הכל": "#fff8f2"
    };
    strip.style.backgroundColor = colors[c] || "#fff8f2";

    renderGrid(recipes.filter(r => r.title.toLowerCase().includes(s) && (c === 'הכל' || r.category === c)));
}

function renderGrid(data = recipes) {
    const grid = document.getElementById('recipeGrid');
    grid.innerHTML = data.map(r => `
        <div class="recipe-card">
            <div onclick="viewRecipe('${r.id}')">
                ${r.imageData ? `<img src="${r.imageData}" alt="${r.title}" class="card-image">` : `<div class="card-emoji">${getIcon(r.category)}</div>`}
                <h4>${r.title}</h4>
                <span class="cat-label">${r.category}</span>
            </div>
            <div class="card-btns-row">
                <button onclick="openModal('${r.id}')">✏️</button>
                <button onclick="deleteRecipe('${r.id}')" style="color:#e74c3c">🗑️</button>
            </div>
        </div>
    `).join('');
}

function getIcon(cat) {
    const icons = { "בשרי": "🥩", "חלבי": "🧀", "מאפים": "🥐", "קינוחים": "🍰", "סלטים": "🥗", "פסטות": "🍝" };
    return icons[cat] || "🍽️";
}

// פונקציה לתצוגה מקדימה של תמונה והמרתה ל-base64
function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');
    const imageDataInput = document.getElementById('editImageData');

    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            preview.src = ev.target.result;
            preview.classList.remove('hidden');
            imageDataInput.value = ev.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function saveRecipe() {
    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle').value.trim();
    if (!title) return;
    const r = {
        id: id || Date.now().toString(),
        title: title,
        category: document.getElementById('editCat').value.replace(/[^א-ת]/g, ""), // ניקוי האייקון מהטקסט
        ingredients: document.getElementById('editIng').value.split('\n').filter(l => l.trim()),
        instructions: document.getElementById('editSteps').value.split('\n').filter(l => l.trim()),
        imageData: document.getElementById('editImageData').value // שמירת ה-base64
    };
    if (id) recipes[recipes.findIndex(x => x.id === id)] = r;
    else recipes.push(r);
    localStorage.setItem(DB_NAME, JSON.stringify(recipes));
    closeModal(); renderGrid();
}

function viewRecipe(id) {
    const r = recipes.find(x => x.id === id);
    const content = document.getElementById('viewAreaContent');
    content.innerHTML = `
        ${r.imageData ? `<img src="${r.imageData}" alt="${r.title}" class="view-image">` : `<div class="view-emoji">${getIcon(r.category)}</div>`}
        <h2 style="color:#d35400">${r.imageData ? "" : getIcon(r.category)} ${r.title}</h2>
        <div class="view-section">
            <strong>📋 מצרכים וכמויות:</strong>
            <ul class="view-list">${r.ingredients.map(i => `<li>${i} <button onclick="addToShop('${i.replace(/'/g,"")}')" class="mini-add">🛒</button></li>`).join('')}</ul>
        </div>
        <div class="view-section">
            <strong>👨‍🍳 הוראות הכנה:</strong>
            <p>${r.instructions.join('<br>')}</p>
        </div>
        <button onclick="shareWA('${r.id}')" class="btn-wa">שתף ב-WhatsApp 💬</button>
    `;
    document.getElementById('recipeView').classList.remove('hidden');
}

function shareWA(id) {
    const r = recipes.find(x => x.id === id);
    const msg = `*${getIcon(r.category)} מתכון: ${r.title}*%0A%0A*מצרכים:*%0A${r.ingredients.join('%0A')}%0A%0A*הוראות:*%0A${r.instructions.join('%0A')}`;
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}

function deleteRecipe(id) {
    if (confirm('למחוק?')) {
        recipes = recipes.filter(r => r.id !== id);
        localStorage.setItem(DB_NAME, JSON.stringify(recipes));
        renderGrid();
    }
}

function addToShop(item) {
    shoppingList.push(item);
    localStorage.setItem(SHOP_NAME, JSON.stringify(shoppingList));
    alert('התווסף!');
}

function toggleShoppingList() {
    const list = document.getElementById('shoppingItems');
    list.innerHTML = shoppingList.map((item, i) => `<li>${item} <button onclick="removeShop(${i})">✕</button></li>`).join('');
    document.getElementById('shoppingModal').classList.remove('hidden');
}

function removeShop(i) {
    shoppingList.splice(i, 1);
    localStorage.setItem(SHOP_NAME, JSON.stringify(shoppingList));
    toggleShoppingList();
}

function clearShoppingList() {
    shoppingList = [];
    localStorage.setItem(SHOP_NAME, JSON.stringify([]));
    toggleShoppingList();
}

function openModal(id = null) {
    const preview = document.getElementById('imagePreview');
    const imageDataInput = document.getElementById('editImageData');

    if (id) {
        const r = recipes.find(x => x.id === id);
        document.getElementById('editId').value = r.id;
        document.getElementById('editTitle').value = r.title;
        document.getElementById('editCat').value = getIcon(r.category) + " " + r.category;
        document.getElementById('editIng').value = r.ingredients.join('\n');
        document.getElementById('editSteps').value = r.instructions.join('\n');
        
        if (r.imageData) {
            preview.src = r.imageData;
            preview.classList.remove('hidden');
            imageDataInput.value = r.imageData;
        } else {
            preview.src = "";
            preview.classList.add('hidden');
            imageDataInput.value = "";
        }
    } else {
        document.getElementById('editId').value = "";
        document.getElementById('editTitle').value = "";
        document.getElementById('editIng').value = "";
        document.getElementById('editSteps').value = "";
        preview.src = "";
        preview.classList.add('hidden');
        imageDataInput.value = "";
    }
    document.getElementById('editModal').classList.remove('hidden');
}

function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }
function exportData() { const data = JSON.stringify({recipes, shoppingList}); const blob = new Blob([data], {type: 'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `chef_backup.json`; a.click(); }
function importData(e) { const reader = new FileReader(); reader.onload = (ev) => { const data = JSON.parse(ev.target.result); recipes = data.recipes; shoppingList = data.shoppingList; localStorage.setItem(DB_NAME, JSON.stringify(recipes)); localStorage.setItem(SHOP_NAME, JSON.stringify(shoppingList)); renderGrid(); alert("בוצע!"); }; reader.readAsText(e.target.files[0]); }

window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });
async function installPWA() { if (!deferredPrompt) return alert("מותקן כבר"); deferredPrompt.prompt(); deferredPrompt = null; }

window.onload = () => { renderGrid(); if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js'); };
