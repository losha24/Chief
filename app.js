/** ChefPro v1.0.4 | Alexey Zavodisker **/

const initialRecipes = [
    { id: "1", title: "שניצל קריספי", category: "בשרי", rating: "5", img: "https://images.unsplash.com/photo-1594834712647-95b3279937dc?w=400", ingredients: ["חזה עוף", "פירורי לחם"], instructions: ["מטגנים"] },
    { id: "2", title: "פסטה רוזה", category: "פסטות", rating: "5", img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400", ingredients: ["פסטה", "שמנת"], instructions: ["מבשלים"] }
];

let recipes = JSON.parse(localStorage.getItem('chef_v1_0_4')) || initialRecipes;
let shoppingList = JSON.parse(localStorage.getItem('shop_v1_0_4')) || [];
let deferredPrompt;

// לוגיקת התקנה PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('installBtn');
    installBtn.style.display = 'inline-block'; // מציג את הכפתור רק אם אפשר להתקין
});

async function installPWA() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        document.getElementById('installBtn').style.backgroundColor = '#ff4d4d'; // הופך לאדום אחרי התקנה
        document.getElementById('installBtn').style.color = 'white';
    }
    deferredPrompt = null;
}

// זיהוי אם כבר מותקן (בחלק מהדפדפנים)
window.addEventListener('appinstalled', () => {
    document.getElementById('installBtn').style.backgroundColor = '#ff4d4d';
    document.getElementById('installBtn').innerText = '✅ מותקן';
});

function renderGrid(data = recipes) {
    const grid = document.getElementById('recipeGrid');
    if (!grid) return;
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

function filterRecipes() {
    const s = document.getElementById('searchInput').value.toLowerCase();
    const c = document.getElementById('categoryFilter').value;
    const filtered = recipes.filter(r => r.title.toLowerCase().includes(s) && (c === 'הכל' || r.category === c));
    renderGrid(filtered);
}

function viewRecipe(id) {
    const r = recipes.find(x => x.id == id);
    const content = document.getElementById('viewAreaContent');
    content.innerHTML = `
        <img src="${r.img}" style="width:100%; border-radius:15px; margin-bottom:15px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2>${r.title}</h2>
            <button onclick="shareToWhatsApp('${r.id}')" style="background:#25D366; color:white; border:none; padding:8px 15px; border-radius:20px; font-weight:bold;">שתף 💬</button>
        </div>
        <p><b>${r.category}</b> | ${'⭐'.repeat(r.rating)}</p>
        <ul style="padding-right:20px;">${r.ingredients.map(i => `<li>${i} <button onclick="addToShop('${i.replace(/'/g,"")}')" style="border:none; background:none;">🛒</button></li>`).join('')}</ul>
        <p>${r.instructions.join('<br>')}</p>
    `;
    document.getElementById('recipeView').classList.remove('hidden');
}

function shareToWhatsApp(id) {
    const r = recipes.find(x => x.id == id);
    const text = `*${r.title}*%0A${r.ingredients.join('%0A')}`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function saveRecipe() {
    const id = document.getElementById('editId').value;
    const r = {
        id: id || Date.now().toString(),
        title: document.getElementById('editTitle').value,
        category: document.getElementById('editCat').value,
        rating: document.getElementById('editRating').value,
        img: id ? recipes.find(x => x.id == id).img : 'https://via.placeholder.com/150',
        ingredients: document.getElementById('editIng').value.split('\n'),
        instructions: document.getElementById('editSteps').value.split('\n')
    };
    if (id) recipes[recipes.findIndex(x => x.id == id)] = r;
    else recipes.push(r);
    localStorage.setItem('chef_v1_0_4', JSON.stringify(recipes));
    closeModal(); renderGrid();
}

function deleteRecipe(id) { if(confirm('למחוק?')) { recipes = recipes.filter(r => r.id != id); localStorage.setItem('chef_v1_0_4', JSON.stringify(recipes)); renderGrid(); } }
function openModal(id = null) {
    if (id) {
        const r = recipes.find(x => x.id == id);
        document.getElementById('editId').value = r.id;
        document.getElementById('editTitle').value = r.title;
        document.getElementById('editCat').value = r.category;
        document.getElementById('editIng').value = r.ingredients.join('\n');
        document.getElementById('editSteps').value = r.instructions.join('\n');
    } else {
        document.querySelectorAll('input, textarea').forEach(i => i.value = '');
    }
    document.getElementById('editModal').classList.remove('hidden');
}
function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }
function silentUpdate() { location.reload(true); }
function addToShop(item) { shoppingList.push(item); localStorage.setItem('shop_v1_0_4', JSON.stringify(shoppingList)); alert('נוסף!'); }
function toggleShoppingList() {
    document.getElementById('shoppingListItems').innerHTML = shoppingList.map((item, i) => `<li>${item}</li>`).join('');
    document.getElementById('shoppingListModal').classList.remove('hidden');
}
function clearShoppingList() { shoppingList = []; localStorage.setItem('shop_v1_0_4', JSON.stringify([])); toggleShoppingList(); }

window.onload = () => renderGrid();
