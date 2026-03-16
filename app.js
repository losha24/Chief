const initialData = [
    { id: "1", title: "שניצל קריספי", category: "בשרי", ingredients: ["חזה עוף פרוס", "ביצים", "פירורי לחם"], instructions: ["טובלים בביצה", "מצפים ומטגנים"] },
    { id: "2", title: "פסטה ברוטב", category: "פסטות", ingredients: ["פסטה", "רסק עגבניות"], instructions: ["מבשלים ומערבבים"] }
];

let recipes = JSON.parse(localStorage.getItem('chef_v110')) || initialData;
let shoppingList = JSON.parse(localStorage.getItem('shop_v110')) || [];
let deferredPrompt;

function updateInstallBtn() {
    const btn = document.getElementById('installBtn');
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    if (isPWA) {
        btn.style.background = "#ff4d4d";
        btn.querySelector('span').innerText = "מותקן";
    } else {
        btn.style.background = "#e3f2fd";
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

async function installPWA() {
    if (!deferredPrompt) return alert("האפליקציה כבר מותקנת");
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') updateInstallBtn();
    deferredPrompt = null;
}

function renderGrid(data = recipes) {
    const grid = document.getElementById('recipeGrid');
    grid.innerHTML = data.map(r => `
        <div class="card">
            <div onclick="viewRecipe('${r.id}')">
                <div class="card-icon">${getIcon(r.category)}</div>
                <h3>${r.title}</h3>
            </div>
            <div class="card-footer">
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
    if (!title) return;
    const r = {
        id: id || Date.now().toString(),
        title: title,
        category: document.getElementById('editCat').value,
        ingredients: document.getElementById('editIng').value.split('\n').filter(l => l.trim()),
        instructions: document.getElementById('editSteps').value.split('\n').filter(l => l.trim())
    };
    if (id) recipes[recipes.findIndex(x => x.id == id)] = r;
    else recipes.push(r);
    localStorage.setItem('chef_v110', JSON.stringify(recipes));
    closeModal();
    renderGrid();
}

function viewRecipe(id) {
    const r = recipes.find(x => x.id == id);
    const content = document.getElementById('viewAreaContent');
    content.innerHTML = `
        <h1 style="color:#d35400">${getIcon(r.category)} ${r.title}</h1>
        <h3>מצרכים:</h3>
        <ul>${r.ingredients.map(i => `<li>${i} <button onclick="addToShop('${i}')">🛒</button></li>`).join('')}</ul>
        <h3>הכנה:</h3>
        <p>${r.instructions.join('<br>')}</p>
        <button onclick="shareWA('${r.id}')" class="btn-confirm" style="background:#25D366">שתף WhatsApp</button>
    `;
    document.getElementById('recipeView').classList.remove('hidden');
}

function shareWA(id) {
    const r = recipes.find(x => x.id == id);
    window.open(`https://wa.me/?text=*${r.title}*%0A${r.ingredients.join('%0A')}`, '_blank');
}

function filterRecipes() {
    const s = document.getElementById('searchInput').value.toLowerCase();
    const c = document.getElementById('categoryFilter').value;
    renderGrid(recipes.filter(r => r.title.toLowerCase().includes(s) && (c === 'הכל' || r.category === c)));
}

function deleteRecipe(id) {
    if (confirm('למחוק?')) {
        recipes = recipes.filter(r => r.id != id);
        localStorage.setItem('chef_v110', JSON.stringify(recipes));
        renderGrid();
    }
}

function exportData() {
    const blob = new Blob([JSON.stringify({recipes, shoppingList})], {type: 'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'chef_backup.json'; a.click();
}

function importData(e) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        const d = JSON.parse(ev.target.result);
        recipes = d.recipes || [];
        localStorage.setItem('chef_v110', JSON.stringify(recipes));
        renderGrid();
    };
    reader.readAsText(e.target.files[0]);
}

function addToShop(item) {
    shoppingList.push(item);
    localStorage.setItem('shop_v110', JSON.stringify(shoppingList));
    alert('נוסף לסל!');
}

function toggleShoppingList() {
    document.getElementById('shoppingItems').innerHTML = shoppingList.map((item, i) => `<li>${item} <button onclick="removeShop(${i})">✕</button></li>`).join('');
    document.getElementById('shoppingModal').classList.remove('hidden');
}

function removeShop(i) {
    shoppingList.splice(i, 1);
    localStorage.setItem('shop_v110', JSON.stringify(shoppingList));
    toggleShoppingList();
}

function clearShoppingList() {
    shoppingList = [];
    localStorage.setItem('shop_v110', JSON.stringify([]));
    toggleShoppingList();
}

function openModal(id = null) {
    document.getElementById('editId').value = id || "";
    if (id) {
        const r = recipes.find(x => x.id == id);
        document.getElementById('editTitle').value = r.title;
        document.getElementById('editCat').value = r.category;
        document.getElementById('editIng').value = r.ingredients.join('\n');
        document.getElementById('editSteps').value = r.instructions.join('\n');
    } else {
        document.getElementById('editTitle').value = "";
        document.getElementById('editIng').value = "";
        document.getElementById('editSteps').value = "";
    }
    document.getElementById('editModal').classList.remove('hidden');
}

function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }

window.onload = () => { renderGrid(); updateInstallBtn(); };
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
