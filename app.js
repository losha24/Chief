const DB_NAME = 'CHEF_APP_STABLE_DB'; // שם קבוע למניעת מחיקה בעדכונים
const SHOP_NAME = 'CHEF_APP_SHOP_DB';

// 12 המתכונים המקוריים שלך
const initialRecipes = [
    { id: "1", title: "שניצל קלאסי", category: "בשרי", ingredients: ["500 גרם חזה עוף", "פירורי לחם", "ביצים", "קמח"], instructions: ["מתבלים את העוף", "טובלים בקמח, ביצה ופירורי לחם", "מטגנים"] },
    { id: "2", title: "קציצות ברוטב", category: "בשרי", ingredients: ["בשר טחון", "בצל", "פטרוזיליה", "רסק עגבניות"], instructions: ["מכינים כדורים", "מטגנים קלות", "מבשלים ברוטב עגבניות 30 דקות"] },
    { id: "3", title: "לזניה גבינות", category: "חלבי", ingredients: ["דפי לזניה", "קוטג'", "גבינה צהובה", "רוטב עגבניות"], instructions: ["מסדרים שכבות", "אופים ב-180 מעלות 40 דקות"] },
    { id: "4", title: "פסטה ברוזה", category: "פסטות", ingredients: ["פסטה", "שמנת לבישול", "רסק עגבניות", "שום"], instructions: ["מבשלים פסטה", "מכינים רוטב משמנת ועגבניות", "מערבבים"] },
    { id: "5", title: "סלט יווני", category: "סלטים", ingredients: ["עגבניה", "מלפפון", "בצל סגול", "בולגרית", "זיתים"], instructions: ["קוצצים ירקות", "מתבלים בשמן זית ולימון", "מפזרים גבינה"] },
    { id: "6", title: "עוגת שוקולד חמה", category: "קינוחים", ingredients: ["שוקולד מריר", "חמאה", "ביצים", "סוכר", "קמח"], instructions: ["ממיסים שוקולד וחמאה", "מוסיפים שאר חומרים", "אופים 10-15 דקות"] },
    { id: "7", title: "בורקס בשר", category: "מאפים", ingredients: ["בצק עלים", "בשר טחון מטוגן", "בצל"], instructions: ["ממלאים בצק בבשר", "סוגרים למשולשים", "אופים עד הזהבה"] },
    { id: "8", title: "מוקפץ עוף", category: "בשרי", ingredients: ["חזה עוף", "גזר", "פלפל", "כרוב", "רוטב סויה"], instructions: ["מטגנים עוף", "מוסיפים ירקות", "מתבלים בסויה וסילאן"] },
    { id: "9", title: "פוקצ'ה ביתית", category: "מאפים", ingredients: ["קמח", "שמרים", "מים", "שמן זית", "מלח גס"], instructions: ["מתפיחים בצק", "יוצרים צורה", "שמים שמן זית ומלח ואופים"] },
    { id: "10", title: "סלט חלומי", category: "סלטים", ingredients: ["גבינת חלומי", "חסות", "אגוזי מלך", "עגבניות שרי"], instructions: ["מטגנים קוביות חלומי", "מניחים על מצע ירקות", "מתבלים בויניגרט"] },
    { id: "11", title: "עוגיות שוקולד צ'יפס", category: "קינוחים", ingredients: ["חמאה", "סוכר חום", "קמח", "נטיפי שוקולד"], instructions: ["מערבבים חומרים", "יוצרים כדורים", "אופים 10 דקות"] },
    { id: "12", title: "פסטה פסטו", category: "פסטות", ingredients: ["פסטה", "בזיליקום", "צנוברים", "שמן זית", "פרמזן"], instructions: ["טוחנים פסטו", "מבשלים פסטה", "מערבבים יחד"] }
];

// טעינת נתונים או שימוש בראשוניים אם ריק
let recipes = JSON.parse(localStorage.getItem(DB_NAME));
if (!recipes || recipes.length === 0) {
    recipes = initialRecipes;
    localStorage.setItem(DB_NAME, JSON.stringify(recipes));
}

let shoppingList = JSON.parse(localStorage.getItem(SHOP_NAME)) || [];

// פונקציית דחיסת תמונה (כדי שלא יגמר המקום בטלפון)
async function compressImage(base64Str) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 600;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
    });
}

function renderGrid(data = recipes) {
    const grid = document.getElementById('recipeGrid');
    grid.innerHTML = data.map(r => `
        <div class="recipe-card">
            <div onclick="viewRecipe('${r.id}')">
                ${r.imageData ? `<img src="${r.imageData}" class="card-image">` : `<div class="card-emoji">${getIcon(r.category)}</div>`}
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

function saveRecipe() {
    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle').value.trim();
    if (!title) return;
    const r = {
        id: id || Date.now().toString(),
        title: title,
        category: document.getElementById('editCat').value.replace(/[^א-ת]/g, "").trim(),
        ingredients: document.getElementById('editIng').value.split('\n').filter(l => l.trim()),
        instructions: document.getElementById('editSteps').value.split('\n').filter(l => l.trim()),
        imageData: document.getElementById('editImageData').value
    };
    if (id) {
        const idx = recipes.findIndex(x => x.id === id);
        recipes[idx] = r;
    } else {
        recipes.push(r);
    }
    localStorage.setItem(DB_NAME, JSON.stringify(recipes));
    closeModal(); renderGrid();
}

function filterRecipes() {
    const s = document.getElementById('searchInput').value.toLowerCase();
    const c = document.getElementById('categoryFilter').value;
    const strip = document.getElementById('titleStrip');
    const colors = { "בשרי": "#f8d7da", "חלבי": "#fff3cd", "מאפים": "#e2e3e5", "קינוחים": "#f3e5f5", "סלטים": "#d4edda", "פסטות": "#fff3cd", "הכל": "#fff8f2" };
    strip.style.backgroundColor = colors[c] || "#fff8f2";

    const filtered = recipes.filter(r => {
        const matchSearch = r.title.toLowerCase().includes(s) || r.ingredients.some(i => i.toLowerCase().includes(s));
        const matchCat = (c === 'הכל' || r.category === c);
        return matchSearch && matchCat;
    });
    renderGrid(filtered);
}

function getIcon(cat) {
    const icons = { "בשרי": "🥩", "חלבי": "🧀", "מאפים": "🥐", "קינוחים": "🍰", "סלטים": "🥗", "פסטות": "🍝" };
    return icons[cat] || "🍽️";
}

function viewRecipe(id) {
    const r = recipes.find(x => x.id === id);
    const content = document.getElementById('viewAreaContent');
    content.innerHTML = `
        ${r.imageData ? `<img src="${r.imageData}" class="view-image">` : `<div class="view-emoji">${getIcon(r.category)}</div>`}
        <h2 style="color:#d35400">${r.title}</h2>
        <div class="view-section">
            <strong>📋 מצרכים:</strong>
            <ul class="view-list">${r.ingredients.map(i => `<li>${i} <button onclick="addToShop('${i.replace(/'/g,"")}')" class="mini-add">🛒</button></li>`).join('')}</ul>
        </div>
        <div class="view-section">
            <strong>👨‍🍳 הוראות:</strong>
            <p>${r.instructions.join('<br>')}</p>
        </div>
        <button onclick="shareWA('${r.id}')" class="btn-wa">שתף ב-WhatsApp 💬</button>
    `;
    document.getElementById('recipeView').classList.remove('hidden');
}

async function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const compressed = await compressImage(ev.target.result);
            document.getElementById('imagePreview').src = compressed;
            document.getElementById('imagePreview').classList.remove('hidden');
            document.getElementById('editImageData').value = compressed;
        };
        reader.readAsDataURL(file);
    }
}

function deleteRecipe(id) {
    if (confirm('למחוק את המתכון?')) {
        recipes = recipes.filter(r => r.id !== id);
        localStorage.setItem(DB_NAME, JSON.stringify(recipes));
        renderGrid();
    }
}

function addToShop(item) {
    shoppingList.push(item);
    localStorage.setItem(SHOP_NAME, JSON.stringify(shoppingList));
    alert('התווסף לסל!');
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
            preview.classList.add('hidden');
            imageDataInput.value = "";
        }
    } else {
        document.getElementById('editId').value = "";
        document.getElementById('editTitle').value = "";
        document.getElementById('editIng').value = "";
        document.getElementById('editSteps').value = "";
        preview.classList.add('hidden');
        imageDataInput.value = "";
    }
    document.getElementById('editModal').classList.remove('hidden');
}

function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }
function exportData() { const data = JSON.stringify({recipes, shoppingList}); const blob = new Blob([data], {type: 'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `chef_backup.json`; a.click(); }
function importData(e) { const reader = new FileReader(); reader.onload = (ev) => { const data = JSON.parse(ev.target.result); recipes = data.recipes; shoppingList = data.shoppingList; localStorage.setItem(DB_NAME, JSON.stringify(recipes)); localStorage.setItem(SHOP_NAME, JSON.stringify(shoppingList)); renderGrid(); alert("בוצע!"); }; reader.readAsText(e.target.files[0]); }
function updateApp() { window.location.reload(true); }

window.onload = () => { renderGrid(); if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js'); };
