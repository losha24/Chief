if ('serviceWorker' in navigator) { navigator.serviceWorker.register('./sw.js'); }

const initialData = [
    { id: "1", title: "פיצה מרגריטה", category: "פיצות", time: "15 דק'", servings: 2, rating: 5, img: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?w=500", ingredients: ["500 גרם קמח", "300 מ\"ל מים", "250 גרם מוצרלה"], instructions: ["לשים", "להתפיח", "לאפות"] }
];

let recipes = JSON.parse(localStorage.getItem('chef_pro_v7')) || initialData;
let shoppingList = JSON.parse(localStorage.getItem('shop_list_v7')) || [];
let deferredPrompt;
let curServings = 1;

window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; document.getElementById('installBtn').classList.remove('hidden'); });
document.getElementById('installBtn').addEventListener('click', () => { if(deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; } });

function init() { renderGrid(recipes); }

function renderGrid(data) {
    const grid = document.getElementById('recipeGrid');
    grid.innerHTML = `<div class="card" onclick="openModal()" style="border:2px dashed #ccc; display:flex; align-items:center; justify-content:center; cursor:pointer; min-height:200px;"><b>+ הוסף מתכון</b></div>` + 
    data.map(r => `
        <div class="card">
            <img src="${r.img}" class="card-img" onclick="viewRecipe('${r.id}')">
            <div class="card-content">
                <span class="tag">${r.category}</span>
                <h3 style="margin:8px 0;">${r.title}</h3>
                <div>${'⭐'.repeat(r.rating || 0)}</div>
            </div>
            <div style="padding:10px; border-top:1px solid #eee; display:flex; justify-content:space-between">
                <button onclick="openModal('${r.id}')" style="border:none; background:none; cursor:pointer">✏️</button>
                <button onclick="deleteRecipe('${r.id}')" style="border:none; background:none; cursor:pointer; color:red">🗑️</button>
            </div>
        </div>
    `).join('');
}

function viewRecipe(id) {
    const r = recipes.find(x => x.id == id);
    curServings = r.servings || 1;
    const content = document.getElementById('viewAreaContent');
    content.innerHTML = `
        <img src="${r.img}" style="width:100%; border-radius:10px;">
        <button class="wa-btn" onclick="shareToWA('${r.id}')">שתף ב-WhatsApp 📱</button>
        <h2>${r.title}</h2>
        <div class="calc-box">
            מנות: <button onclick="adj('${r.id}',-1)">-</button> <b>${curServings}</b> <button onclick="adj('${r.id}',1)">+</button>
        </div>
        <h4>מצרכים:</h4>
        <ul>${r.ingredients.map(i => `<li><button onclick="toShop('${scale(i,r.servings,curServings)}')">🛒</button> ${scale(i,r.servings,curServings)}</li>`).join('')}</ul>
        <h4>הוראות:</h4><p>${r.instructions.join('<br>')}</p>
    `;
    document.getElementById('recipeView').classList.remove('hidden');
}

function scale(ing, orig, cur) {
    const ratio = cur / orig;
    return ing.replace(/(\d+(\.\d+)?)/g, m => (parseFloat(m) * ratio).toFixed(1).replace(/\.0$/, ''));
}

function adj(id, d) { if(curServings+d > 0) { curServings += d; viewRecipe(id); } }

function toShop(i) { shoppingList.push(i); localStorage.setItem('shop_list_v7', JSON.stringify(shoppingList)); alert('נוסף!'); }

function saveRecipe() {
    const id = document.getElementById('editId').value;
    const r = {
        id: id || Date.now().toString(),
        title: document.getElementById('editTitle').value,
        category: document.getElementById('editCat').value,
        time: document.getElementById('editTime').value,
        servings: parseInt(document.getElementById('editServings').value) || 1,
        img: document.getElementById('editImg').value,
        ingredients: document.getElementById('editIng').value.split('\n'),
        instructions: document.getElementById('editSteps').value.split('\n'),
        rating: 5
    };
    if(id) recipes[recipes.findIndex(x => x.id == id)] = r;
    else recipes.push(r);
    localStorage.setItem('chef_pro_v7', JSON.stringify(recipes));
    closeModal();
    init();
}

function deleteRecipe(id) { if(confirm('למחוק?')) { recipes = recipes.filter(x => x.id != id); localStorage.setItem('chef_pro_v7', JSON.stringify(recipes)); init(); } }
function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }
function toggleShoppingList() {
    const l = document.getElementById('shoppingListItems');
    l.innerHTML = shoppingList.map((item, i) => `<li>${item} <button onclick="remShop(${i})">✕</button></li>`).join('');
    document.getElementById('shoppingListModal').classList.remove('hidden');
}
function remShop(i) { shoppingList.splice(i, 1); localStorage.setItem('shop_list_v7', JSON.stringify(shoppingList)); toggleShoppingList(); }
function clearShoppingList() { shoppingList = []; localStorage.setItem('shop_list_v7', JSON.stringify(shoppingList)); toggleShoppingList(); }

init();
