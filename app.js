/** Chef Manager Pro - Final Production Version | Alexey Zavodisker **/
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js'); }

const initialData = [
    { id: "1", title: "פיצה מרגריטה", category: "פיצות", time: "15 דק'", servings: 2, rating: 5, img: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?w=500", ingredients: ["500 גרם קמח", "300 מ\"ל מים", "250 גרם מוצרלה"], instructions: ["לשים", "להתפיח", "לאפות"] },
    { id: "2", title: "סופלה שוקולד", category: "קינוחים", time: "15 דק'", servings: 4, rating: 5, img: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500", ingredients: ["200 גרם שוקולד", "100 גרם חמאה", "3 ביצים"], instructions: ["להמיס", "לערבב", "לאפות 10 דק'"] }
];

let recipes = JSON.parse(localStorage.getItem('chef_pro_alexey')) || initialData;
let shoppingList = JSON.parse(localStorage.getItem('shop_list_alexey')) || [];
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; document.getElementById('installBtn').classList.remove('hidden'); });
document.getElementById('installBtn').addEventListener('click', () => { if(deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; } });

function init() { renderGrid(recipes); updateCategories(); }
function renderGrid(data) {
    const grid = document.getElementById('recipeGrid');
    grid.innerHTML = `<div class="card" onclick="openModal()" style="border:2px dashed #ccc; display:flex; align-items:center; justify-content:center; cursor:pointer; height:235px;"><b>+ הוסף מתכון</b></div>` + 
    data.map(r => `
        <div class="card">
            <img src="${r.img || ''}" class="card-img" onclick="viewRecipe('${r.id}')">
            <div class="card-content">
                <span class="tag">${r.category}</span>
                <h3 style="margin:5px 0;">${r.title}</h3>
                <div>${'⭐'.repeat(r.rating || 0)}</div>
            </div>
            <div style="padding:10px; border-top:1px solid #eee; display:flex; justify-content:space-between">
                <button onclick="openModal('${r.id}')" style="border:none; background:none; cursor:pointer">✏️ ערוך</button>
                <button onclick="deleteRecipe('${r.id}')" style="border:none; background:none; cursor:pointer; color:red">🗑️ מחק</button>
            </div>
        </div>
    `).join('');
}

let curServings = 1;
function viewRecipe(id) {
    const r = recipes.find(x => x.id === id);
    curServings = r.servings || 1;
    const content = document.getElementById('viewAreaContent');
    content.innerHTML = `
        <img src="${r.img}" style="width:100%; border-radius:10px;">
        <button class="share-wa-btn" onclick="shareToWhatsApp('${r.id}')">שתף ב-WhatsApp</button>
        <h2>${r.title}</h2>
        <div style="margin:10px 0;">מנות: <button onclick="adj(1)">+</button> <b>${curServings}</b> <button onclick="adj(-1)">-</button></div>
        <h4>מצרכים:</h4>
        <ul id="ingList">${r.ingredients.map(i => `<li><button onclick="addToShop('${i}')">🛒</button> ${i}</li>`).join('')}</ul>
        <h4>הוראות:</h4><p>${r.instructions.join('<br>')}</p>
    `;
    document.getElementById('recipeView').classList.remove('hidden');
}

function shareToWhatsApp(id) {
    const r = recipes.find(x => x.id === id);
    const text = encodeURIComponent(`*${r.title}*\n\n*מצרכים:*\n${r.ingredients.join('\n')}`);
    window.open(`https://wa.me/?text=${text}`);
}

function addToShop(i) { shoppingList.push(i); localStorage.setItem('shop_list_alexey', JSON.stringify(shoppingList)); alert('נוסף!'); }
function toggleShoppingList() {
    const l = document.getElementById('shoppingListItems');
    l.innerHTML = shoppingList.map((item, i) => `<li>${item} <button onclick="remShop(${i})">✕</button></li>`).join('');
    document.getElementById('shoppingListModal').classList.remove('hidden');
}
function remShop(i) { shoppingList.splice(i, 1); localStorage.setItem('shop_list_alexey', JSON.stringify(shoppingList)); toggleShoppingList(); }
function clearShoppingList() { shoppingList = []; localStorage.setItem('shop_list_alexey', JSON.stringify(shoppingList)); toggleShoppingList(); }

function saveRecipe() {
    const r = {
        id: Date.now().toString(),
        title: document.getElementById('editTitle').value,
        category: document.getElementById('editCat').value,
        time: document.getElementById('editTime').value,
        servings: document.getElementById('editServings').value,
        img: document.getElementById('editImg').value,
        ingredients: document.getElementById('editIngredients').value.split('\n'),
        instructions: document.getElementById('editSteps').value.split('\n'),
        rating: 5
    };
    recipes.push(r);
    localStorage.setItem('chef_pro_alexey', JSON.stringify(recipes));
    location.reload();
}

function deleteRecipe(id) { if(confirm('למחוק?')) { recipes = recipes.filter(x => x.id !== id); localStorage.setItem('chef_pro_alexey', JSON.stringify(recipes)); init(); } }
function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }
function updateCategories() { /* לוגיקת סינון */ }
function handleSearch() { /* לוגיקת חיפוש */ }
function exportData() { /* לוגיקת ייצוא */ }
init();
