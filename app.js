const DB_NAME = 'chef_v2_data';
const SHOP_NAME = 'chef_v2_shop';

const initialRecipes = [
    { id: "1", title: "שניצל קלאסי", category: "בשרי", ingredients: ["חזה עוף", "פירורי לחם", "ביצה"], instructions: ["מטגנים עד להזהבה"] }
];

let recipes = JSON.parse(localStorage.getItem(DB_NAME)) || initialRecipes;
let shoppingList = JSON.parse(localStorage.getItem(SHOP_NAME)) || [];
let deferredPrompt;

// עדכון אפליקציה וגרסה
function updateApp() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
                registration.unregister();
            }
            location.reload(true);
        });
    } else {
        location.reload(true);
    }
}

// ניהול התקנה
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('installBtn');
    if(btn) btn.classList.add('ready-to-install');
});

async function installPWA() {
    if (!deferredPrompt) {
        alert("האפליקציה כבר מותקנת או שאינה נתמכת כרגע.");
        return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
}

function renderGrid(data = recipes) {
    const grid = document.getElementById('recipeGrid');
    grid.innerHTML = data.map(r => `
        <div class="recipe-card">
            <div onclick="viewRecipe('${r.id}')" class="card-clickable">
                <div class="card-emoji">${getIcon(r.category)}</div>
                <h4>${r.title}</h4>
                <span class="cat-label">${r.category}</span>
            </div>
            <div class="card-actions">
                <button onclick="openModal('${r.id}')">✏️</button>
                <button onclick="deleteRecipe('${r.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

function getIcon(cat) {
    const icons = { "בשרי": "🥩", "חלבי": "🧀", "מאפים": "🥐", "קינוחים": "🍰", "סלטים": "🥗", "פסטות": "🍝" };
    return icons[cat] || "🍽️";
}

function saveRecipe() {
    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle').value.trim();
    if (!title) return alert("חובה להזין שם");

    const recipe = {
        id: id || Date.now().toString(),
        title: title,
        category: document.getElementById('editCat').value,
        ingredients: document.getElementById('editIng').value.split('\n').filter(l => l.trim()),
        instructions: document.getElementById('editSteps').value.split('\n').filter(l => l.trim())
    };

    if (id) {
        const index = recipes.findIndex(r => r.id === id);
        recipes[index] = recipe;
    } else {
        recipes.push(recipe);
    }

    localStorage.setItem(DB_NAME, JSON.stringify(recipes));
    closeModal();
    renderGrid();
}

function viewRecipe(id) {
    const r = recipes.find(x => x.id === id);
    const content = document.getElementById('viewAreaContent');
    content.innerHTML = `
        <h2 style="color:#d35400">${getIcon(r.category)} ${r.title}</h2>
        <div class="view-section">
            <strong>📋 מצרכים:</strong>
            <ul>${r.ingredients.map(i => `<li>${i} <button class="mini-cart-btn" onclick="addToShop('${i}')">🛒</button></li>`).join('')}</ul>
        </div>
        <div class="view-section">
            <strong>👨‍🍳 אופן ההכנה:</strong>
            <p>${r.instructions.join('<br>')}</p>
        </div>
        <button onclick="shareWA('${r.id}')" class="btn-wa">שתף ב-WhatsApp</button>
    `;
    document.getElementById('recipeView').classList.remove('hidden');
}

function shareWA(id) {
    const r = recipes.find(x => x.id === id);
    const text = `*מתכון: ${r.title}*%0A%0A*מצרכים:*%0A${r.ingredients.join('%0A')}`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function filterRecipes() {
    const s = document.getElementById('searchInput').value.toLowerCase();
    const c = document.getElementById('categoryFilter').value;
    const filtered = recipes.filter(r => r.title.toLowerCase().includes(s) && (c === 'הכל' || r.category === c));
    renderGrid(filtered);
}

function deleteRecipe(id) {
    if (confirm('למחוק את המתכון?')) {
        recipes = recipes.filter(r => r.id !== id);
        localStorage.setItem(DB_NAME, JSON.stringify(recipes));
        renderGrid();
    }
}

function exportData() {
    const data = JSON.stringify({recipes, shoppingList});
    const blob = new Blob([data], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `chef_backup_v2_${new Date().toLocaleDateString()}.json`;
    a.click();
}

function importData(e) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            recipes = data.recipes || [];
            shoppingList = data.shoppingList || [];
            localStorage.setItem(DB_NAME, JSON.stringify(recipes));
            localStorage.setItem(SHOP_NAME, JSON.stringify(shoppingList));
            renderGrid();
            alert("הנתונים שוחזרו בהצלחה!");
        } catch(err) { alert("קובץ לא תקין"); }
    };
    reader.readAsText(e.target.files[0]);
}

function addToShop(item) {
    shoppingList.push(item);
    localStorage.setItem(SHOP_NAME, JSON.stringify(shoppingList));
    alert('התווסף לרשימה!');
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
    if(confirm('לנקות את כל הרשימה?')) {
        shoppingList = [];
        localStorage.setItem(SHOP_NAME, JSON.stringify([]));
        toggleShoppingList();
    }
}

function openModal(id = null) {
    const mid = document.getElementById('editId');
    const title = document.getElementById('editTitle');
    const cat = document.getElementById('editCat');
    const ing = document.getElementById('editIng');
    const steps = document.getElementById('editSteps');

    if (id) {
        const r = recipes.find(x => x.id === id);
        mid.value = r.id;
        title.value = r.title;
        cat.value = r.category;
        ing.value = r.ingredients.join('\n');
        steps.value = r.instructions.join('\n');
    } else {
        mid.value = "";
        title.value = "";
        ing.value = "";
        steps.value = "";
    }
    document.getElementById('editModal').classList.remove('hidden');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

window.onload = () => {
    renderGrid();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
    }
};
