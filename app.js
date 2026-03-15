/** ChefPro v1.0.8 | Alexey Zavodisker **/

const initialData = [
    { id: "1", title: "שניצל קריספי", category: "בשרי", ingredients: ["חזה עוף פרוס", "ביצים", "פירורי לחם"], instructions: ["טובלים בביצה", "מצפים ומטגנים"] },
    { id: "2", title: "פסטה ברוטב עגבניות", category: "פסטות", ingredients: ["פסטה", "רסק עגבניות", "שום"], instructions: ["מבשלים פסטה ומערבבים עם הרוטב"] }
];

let recipes = JSON.parse(localStorage.getItem('chef_v108_final')) || initialData;
let shoppingList = JSON.parse(localStorage.getItem('shop_v108_final')) || [];
let deferredPrompt;

// PWA Install Logic
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('installBtn');
    if(btn) btn.style.display = 'inline-block';
});

async function installPWA() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        const btn = document.getElementById('installBtn');
        btn.style.backgroundColor = '#ff4d4d'; 
        btn.style.color = 'white';
        btn.innerText = '✅ מותקן';
    }
    deferredPrompt = null;
}

function renderGrid(data = recipes) {
    const grid = document.getElementById('recipeGrid');
    if (!grid) return;
    grid.innerHTML = data.map(r => `
        <div class="card">
            <div onclick="viewRecipe('${r.id}')">
                <div class="card-icon">${getIcon(r.category)}</div>
                <h3 class="card-title">${r.title}</h3>
                <span class="card-tag">${r.category}</span>
            </div>
            <div class="card-btns">
                <button onclick="openModal('${r.id}')">✏️</button>
                <button onclick="deleteRecipe('${r.id}')" style="color:#ff6b6b">🗑️</button>
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
    if (!title) return alert("נא להזין שם למתכון");

    const r = {
        id: id || Date.now().toString(),
        title: title,
        category: document.getElementById('editCat').value,
        ingredients: document.getElementById('editIng').value.split('\n').filter(l => l.trim()),
        instructions: document.getElementById('editSteps').value.split('\n').filter(l => l.trim())
    };

    if (id) recipes[recipes.findIndex(x => x.id == id)] = r;
    else recipes.push(r);

    localStorage.setItem('chef_v108_final', JSON.stringify(recipes));
    closeModal();
    renderGrid();
}

function viewRecipe(id) {
    const r = recipes.find(x => x.id == id);
    const content = document.getElementById('viewAreaContent');
    content.innerHTML = `
        <div class="view-card">
            <h1 class="view-title">${getIcon(r.category)} ${r.title}</h1>
            <div class="view-section">
                <h3>📋 מצרכים</h3>
                <ul>${r.ingredients.map(i => `<li>${i} <button onclick="addToShop('${i}')" class="mini-add-btn">🛒</button></li>`).join('')}</ul>
            </div>
            <div class="view-section">
                <h3>👨‍🍳 הוראות הכנה</h3>
                <p>${r.instructions.join('<br>')}</p>
            </div>
            <button onclick="shareWA('${r.id}')" class="btn-wa">שתף ב-WhatsApp 💬</button>
        </div>
    `;
    document.getElementById('recipeView').classList.remove('hidden');
}

function shareWA(id) {
    const r = recipes.find(x => x.id == id);
    const text = `*מתכון מהשף:* %0A*${r.title}*%0A%0A*מצרכים:*%0A${r.ingredients.join('%0A')}`;
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
        recipes = recipes.filter(r => r.id != id);
        localStorage.setItem('chef_v108_final', JSON.stringify(recipes));
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
        const data = JSON.parse(ev.target.result);
        recipes = data.recipes || [];
        localStorage.setItem('chef_v108_final', JSON.stringify(recipes));
        renderGrid();
        alert("הנתונים שוחזרו בהצלחה!");
    };
    reader.readAsText(e.target.files[0]);
}

function addToShop(item) {
    shoppingList.push(item);
    localStorage.setItem('shop_v108_final', JSON.stringify(shoppingList));
    alert('נוסף לרשימה!');
}

function toggleShoppingList() {
    const list = document.getElementById('shoppingItems');
    list.innerHTML = shoppingList.map((item, i) => `<li>${item} <button onclick="removeShop(${i})">✕</button></li>`).join('');
    document.getElementById('shoppingModal').classList.remove('hidden');
}

function removeShop(i) {
    shoppingList.splice(i, 1);
    localStorage.setItem('shop_v108_final', JSON.stringify(shoppingList));
    toggleShoppingList();
}

function clearShoppingList() {
    shoppingList = [];
    localStorage.setItem('shop_v108_final', JSON.stringify([]));
    toggleShoppingList();
}

function openModal(id = null) {
    document.getElementById('editId').value = "";
    document.getElementById('editTitle').value = "";
    document.getElementById('editIng').value = "";
    document.getElementById('editSteps').value = "";
    if (id) {
        const r = recipes.find(x => x.id == id);
        document.getElementById('editId').value = r.id;
        document.getElementById('editTitle').value = r.title;
        document.getElementById('editCat').value = r.category;
        document.getElementById('editIng').value = r.ingredients.join('\n');
        document.getElementById('editSteps').value = r.instructions.join('\n');
        document.getElementById('modalTitle').innerText = "עריכת מתכון";
    }
    document.getElementById('editModal').classList.remove('hidden');
}

function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }

window.onload = () => renderGrid();
