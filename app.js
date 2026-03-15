/** ChefPro v1.0.7 | Alexey Zavodisker **/

const initialData = [
    { id: "1", title: "שניצל קריספי", category: "בשרי", ingredients: ["חזה עוף", "פירורי לחם"], instructions: ["מטגנים"] },
    { id: "2", title: "פסטה רוזה", category: "פסטות", ingredients: ["פסטה", "שמנת"], instructions: ["מבשלים"] }
];

let recipes = JSON.parse(localStorage.getItem('chef_final_stable')) || initialData;
let shoppingList = JSON.parse(localStorage.getItem('shop_final_stable')) || [];
let deferredPrompt;

// PWA Install Logic
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('installBtn');
    btn.style.display = 'inline-block';
});

async function installPWA() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        const btn = document.getElementById('installBtn');
        btn.style.backgroundColor = 'red'; // הופך לאדום לאחר התקנה
        btn.innerText = '✅ מותקן';
    }
}

function renderGrid(data = recipes) {
    const grid = document.getElementById('recipeGrid');
    grid.innerHTML = data.map(r => `
        <div class="card">
            <div onclick="viewRecipe('${r.id}')">
                <div class="card-icon">${getIcon(r.category)}</div>
                <h3>${r.title}</h3>
            </div>
            <div class="card-btns">
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
    if (!title) return alert("צריך שם!");

    const r = {
        id: id || Date.now().toString(),
        title: title,
        category: document.getElementById('editCat').value,
        ingredients: document.getElementById('editIng').value.split('\n').filter(l => l.trim()),
        instructions: document.getElementById('editSteps').value.split('\n').filter(l => l.trim())
    };

    if (id) recipes[recipes.findIndex(x => x.id == id)] = r;
    else recipes.push(r);

    localStorage.setItem('chef_final_stable', JSON.stringify(recipes));
    closeModal();
    renderGrid();
}

function viewRecipe(id) {
    const r = recipes.find(x => x.id == id);
    const content = document.getElementById('viewAreaContent');
    content.innerHTML = `
        <h1>${getIcon(r.category)} ${r.title}</h1>
        <h4>מצרכים:</h4>
        <p>${r.ingredients.join('<br>')}</p>
        <h4>הוראות:</h4>
        <p>${r.instructions.join('<br>')}</p>
        <button onclick="shareWA('${r.id}')" class="btn-save" style="background:#25D366">שתף בוואצאפ 💬</button>
    `;
    document.getElementById('recipeView').classList.remove('hidden');
}

function shareWA(id) {
    const r = recipes.find(x => x.id == id);
    const text = `*${r.title}*%0A${r.ingredients.join('%0A')}`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function filterRecipes() {
    const s = document.getElementById('searchInput').value.toLowerCase();
    const c = document.getElementById('categoryFilter').value;
    const filtered = recipes.filter(r => r.title.toLowerCase().includes(s) && (c === 'הכל' || r.category === c));
    renderGrid(filtered);
}

function deleteRecipe(id) {
    if (confirm('למחוק?')) {
        recipes = recipes.filter(r => r.id != id);
        localStorage.setItem('chef_final_stable', JSON.stringify(recipes));
        renderGrid();
    }
}

function exportData() {
    const blob = new Blob([JSON.stringify({ recipes, shoppingList })], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'chef_backup.json'; a.click();
}

function importData(e) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        const d = JSON.parse(ev.target.result);
        recipes = d.recipes || [];
        localStorage.setItem('chef_final_stable', JSON.stringify(recipes));
        renderGrid();
    };
    reader.readAsText(e.target.files[0]);
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
    }
    document.getElementById('editModal').classList.remove('hidden');
}

function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }

window.onload = renderGrid;
