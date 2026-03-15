/** ChefPro v1.0.7 | Alexey Zavodisker **/

const initialData = [
    { id: "1", title: "שניצל קריספי", category: "בשרי", ingredients: ["חזה עוף פרוס", "ביצים", "פירורי לחם", "מלח ופלפל"], instructions: ["טובלים בביצה", "מצפים בפירורי לחם", "מטגנים עד להזהבה"] },
    { id: "2", title: "פסטה ברוטב עגבניות", category: "פסטות", ingredients: ["חבילת פסטה", "רסק עגבניות", "שום", "שמן זית"], instructions: ["מבשלים פסטה", "מטגנים שום", "מוסיפים רסק ותבלינים ומערבבים"] }
];

// טעינת נתונים - שימוש במפתח ייחודי למניעת התנגשויות
let recipes = JSON.parse(localStorage.getItem('chef_v107_data')) || initialData;
let shoppingList = JSON.parse(localStorage.getItem('chef_v107_shop')) || [];
let deferredPrompt;

// לוגיקת התקנה PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBtn').style.display = 'inline-block';
});

async function installPWA() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        const btn = document.getElementById('installBtn');
        btn.style.backgroundColor = 'red'; // הופך לאדום כפי שביקשת
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
                <h3>${r.title}</h3>
                <small>${r.category}</small>
            </div>
            <div class="card-btns">
                <button onclick="openModal('${r.id}')">✏️</button>
                <button onclick="deleteRecipe('${r.id}')" style="color:red">🗑️</button>
            </div>
        </div>
    `).join('');
}

function getIcon(cat) {
    if (cat.includes("בשרי")) return "🥩";
    if (cat.includes("חלבי")) return "🧀";
    if (cat.includes("מאפים")) return "🥐";
    if (cat.includes("קינוחים")) return "🍰";
    if (cat.includes("סלטים")) return "🥗";
    if (cat.includes("פסטות")) return "🍝";
    return "🍽️";
}

function saveRecipe() {
    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle').value.trim();
    const cat = document.getElementById('editCat').value;
    
    if (!title) return alert("נא להזין שם למתכון");

    const newR = {
        id: id || Date.now().toString(),
        title: title,
        category: cat,
        ingredients: document.getElementById('editIng').value.split('\n').filter(l => l.trim()),
        instructions: document.getElementById('editSteps').value.split('\n').filter(l => l.trim())
    };

    if (id) {
        const idx = recipes.findIndex(x => x.id == id);
        recipes[idx] = newR;
    } else {
        recipes.push(newR);
    }

    localStorage.setItem('chef_v107_data', JSON.stringify(recipes));
    closeModal();
    renderGrid();
}

function deleteRecipe(id) {
    if (confirm('למחוק את המתכון?')) {
        recipes = recipes.filter(r => r.id != id);
        localStorage.setItem('chef_v107_data', JSON.stringify(recipes));
        renderGrid();
    }
}

function viewRecipe(id) {
    const r = recipes.find(x => x.id == id);
    const content = document.getElementById('viewAreaContent');
    content.innerHTML = `
        <div class="view-header">
            <h1>${getIcon(r.category)} ${r.title}</h1>
            <button onclick="shareWA('${r.id}')" class="btn-wa">שיתוף WhatsApp 💬</button>
        </div>
        <h3>מצרכים:</h3>
        <ul>${r.ingredients.map(i => `<li>${i} <button onclick="addToShop('${i}')">🛒</button></li>`).join('')}</ul>
        <h3>הוראות הכנה:</h3>
        <p>${r.instructions.join('<br>')}</p>
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
    const filtered = recipes.filter(r => 
        r.title.toLowerCase().includes(s) && (c === 'הכל' || r.category.includes(c))
    );
    renderGrid(filtered);
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
        shoppingList = data.shoppingList || [];
        localStorage.setItem('chef_v107_data', JSON.stringify(recipes));
        localStorage.setItem('chef_v107_shop', JSON.stringify(shoppingList));
        renderGrid();
        alert("הנתונים שוחזרו!");
    };
    reader.readAsText(e.target.files[0]);
}

function addToShop(item) {
    shoppingList.push(item);
    localStorage.setItem('chef_v107_shop', JSON.stringify(shoppingList));
    alert('נוסף לסל!');
}

function toggleShoppingList() {
    const list = document.getElementById('shoppingItems');
    list.innerHTML = shoppingList.map((item, i) => `<li>${item} <button onclick="removeShop(${i})">✕</button></li>`).join('');
    document.getElementById('shoppingModal').classList.remove('hidden');
}

function removeShop(i) {
    shoppingList.splice(i, 1);
    localStorage.setItem('chef_v107_shop', JSON.stringify(shoppingList));
    toggleShoppingList();
}

function clearShoppingList() {
    shoppingList = [];
    localStorage.setItem('chef_v107_shop', JSON.stringify([]));
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
    } else {
        document.getElementById('modalTitle').innerText = "מתכון חדש";
    }
    document.getElementById('editModal').classList.remove('hidden');
}

function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }

window.onload = () => renderGrid();
