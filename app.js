const DB_NAME = 'chef_v21_data';
const SHOP_NAME = 'chef_v21_shop';

const initialRecipes = [
    { id: "1", title: "שניצל קלאסי", category: "בשרי", ingredients: ["חזה עוף פרוס", "פירורי לחם", "ביצה"], instructions: ["טובלים בביצה", "מצפים בפירורי לחם", "מטגנים"] },
    { id: "2", title: "צלי בקר חגיגי", category: "בשרי", ingredients: ["נתח בקר", "בצל", "יין אדום"], instructions: ["סוגרים את הבשר", "מבשלים עם יין ובצל 3 שעות"] },
    { id: "3", title: "לזניה גבינות", category: "חלבי", ingredients: ["דפי לזניה", "גבינה צהובה", "קוטג'", "רוטב עגבניות"], instructions: ["מסדרים שכבות", "אופים 40 דקות"] },
    { id: "4", title: "שקשוקה בולגרית", category: "חלבי", ingredients: ["עגבניות", "שום", "ביצים", "גבינה בולגרית"], instructions: ["מבשלים רוטב", "מוסיפים ביצים ובולגרית"] },
    { id: "5", title: "לחם שום ביתי", category: "מאפים", ingredients: ["בצק שמרים", "שום", "שמן זית", "פטרוזיליה"], instructions: ["מורחים על הבצק", "אופים עד הזהבה"] },
    { id: "6", title: "בורקס גבינה", category: "מאפים", ingredients: ["בצק עלים", "גבינה לבנה", "ביצה"], instructions: ["ממלאים את הבצק", "אופים 25 דקות"] },
    { id: "7", title: "מוס שוקולד", category: "קינוחים", ingredients: ["שוקולד מריר", "שמנת מתוקה"], instructions: ["ממיסים שוקולד", "מקציפים שמנת ומערבבים"] },
    { id: "8", title: "עוגיות שוקולד צ'יפס", category: "קינוחים", ingredients: ["קמח", "חמאה", "שוקולד צ'יפס"], instructions: ["מערבבים", "אופים 12 דקות"] },
    { id: "9", title: "סלט יווני", category: "סלטים", ingredients: ["מלפפון", "עגבניה", "בצל סגול", "זיתים", "בולגרית"], instructions: ["חותכים", "מתבלים בשמן זית ולימון"] },
    { id: "10", title: "סלט כרוב וגזר", category: "סלטים", ingredients: ["כרוב לבן", "גזר", "מיונז"], instructions: ["קוצצים ומערבבים"] },
    { id: "11", title: "פסטה רוזה", category: "פסטות", ingredients: ["פסטה", "שמנת לבישול", "רסק עגבניות"], instructions: ["מבשלים פסטה", "מכינים רוטב ומערבבים"] },
    { id: "12", title: "פוקצ'ה איטלקית", category: "מאפים", ingredients: ["קמח", "שמרים", "שמן זית", "מלח גס"], instructions: ["מתפיחים את הבצק", "אופים עם שמן זית"] }
];

let recipes = JSON.parse(localStorage.getItem(DB_NAME)) || initialRecipes;
let shoppingList = JSON.parse(localStorage.getItem(SHOP_NAME)) || [];
let deferredPrompt;

function updateApp() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) registration.unregister();
            window.location.reload(true);
        });
    } else { window.location.reload(true); }
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

async function installPWA() {
    if (!deferredPrompt) return alert("האפליקציה כבר מותקנת");
    deferredPrompt.prompt();
    deferredPrompt = null;
}

function renderGrid(data = recipes) {
    const grid = document.getElementById('recipeGrid');
    grid.innerHTML = data.map(r => `
        <div class="recipe-card">
            <div onclick="viewRecipe('${r.id}')">
                <div class="card-emoji">${getIcon(r.category)}</div>
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

function saveRecipe() {
    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle').value.trim();
    if (!title) return;

    const r = {
        id: id || Date.now().toString(),
        title: title,
        category: document.getElementById('editCat').value,
        ingredients: document.getElementById('editIng').value.split('\n').filter(l => l.trim()),
        instructions: document.getElementById('editSteps').value.split('\n').filter(l => l.trim())
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
        <h2 style="color:#d35400">${getIcon(r.category)} ${r.title}</h2>
        <div class="view-section">
            <strong>📋 מצרכים:</strong>
            <ul class="view-list">${r.ingredients.map(i => `<li>${i} <button onclick="addToShop('${i}')" class="mini-add">🛒</button></li>`).join('')}</ul>
        </div>
        <div class="view-section">
            <strong>👨‍🍳 הכנה:</strong>
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

function filterRecipes() {
    const s = document.getElementById('searchInput').value.toLowerCase();
    const c = document.getElementById('categoryFilter').value;
    renderGrid(recipes.filter(r => r.title.toLowerCase().includes(s) && (c === 'הכל' || r.category === c)));
}

function deleteRecipe(id) {
    if (confirm('למחוק?')) {
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
    a.download = `chef_backup_v21.json`;
    a.click();
}

function importData(e) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        const data = JSON.parse(ev.target.result);
        recipes = data.recipes; shoppingList = data.shoppingList;
        localStorage.setItem(DB_NAME, JSON.stringify(recipes));
        localStorage.setItem(SHOP_NAME, JSON.stringify(shoppingList));
        renderGrid(); alert("בוצע!");
    };
    reader.readAsText(e.target.files[0]);
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
    if (id) {
        const r = recipes.find(x => x.id === id);
        document.getElementById('editId').value = r.id;
        document.getElementById('editTitle').value = r.title;
        document.getElementById('editCat').value = r.category;
        document.getElementById('editIng').value = r.ingredients.join('\n');
        document.getElementById('editSteps').value = r.instructions.join('\n');
    } else {
        document.getElementById('editId').value = "";
        document.getElementById('editTitle').value = "";
        document.getElementById('editIng').value = "";
        document.getElementById('editSteps').value = "";
    }
    document.getElementById('editModal').classList.remove('hidden');
}

function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }

window.onload = () => { renderGrid(); if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js'); };
