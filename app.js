/** ChefPro v1.0.6 | Alexey Zavodisker **/

const initialRecipes = [
    { id: "1", title: "שניצל קריספי", category: "בשרי", rating: "5", img: "https://images.unsplash.com/photo-1594834712647-95b3279937dc?w=400", ingredients: ["חזה עוף", "פירורי לחם"], instructions: ["מטגנים עד הזהבה"] },
    { id: "2", title: "פסטה רוזה", category: "פסטות", rating: "5", img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400", ingredients: ["פסטה", "שמנת"], instructions: ["מבשלים ומערבבים"] }
];

// טעינה חכמה - אם הזיכרון ריק, נטען את הבסיסיים
let recipes = JSON.parse(localStorage.getItem('chef_v1_0_6'));
if (!recipes || recipes.length === 0) {
    recipes = initialRecipes;
}

let shoppingList = JSON.parse(localStorage.getItem('shop_v1_0_6')) || [];
let tempImageData = "";
let deferredPrompt;

// PWA Install
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
        document.getElementById('installBtn').style.backgroundColor = 'red';
        document.getElementById('installBtn').innerText = '✅ הותקן';
    }
}

function renderGrid(data = recipes) {
    const grid = document.getElementById('recipeGrid');
    if (!grid) return;
    grid.innerHTML = data.map(r => `
        <div class="card">
            <img src="${r.img || 'https://via.placeholder.com/150'}" class="card-img" onclick="viewRecipe('${r.id}')">
            <div class="card-content">
                <span class="tag">${r.category}</span>
                <h3>${r.title}</h3>
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
    const filtered = recipes.filter(r => 
        r.title.toLowerCase().includes(s) && (c === 'הכל' || r.category === c)
    );
    renderGrid(filtered);
}

function saveRecipe() {
    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle').value.trim();
    const cat = document.getElementById('editCat').value;

    if (!title || !cat) {
        alert("נא למלא שם וקטגוריה!");
        return;
    }

    const newRecipe = {
        id: id || Date.now().toString(),
        title: title,
        category: cat,
        rating: "5",
        img: tempImageData || (id ? recipes.find(x => x.id == id).img : 'https://via.placeholder.com/150'),
        ingredients: document.getElementById('editIng').value.split('\n').filter(l => l.trim()),
        instructions: document.getElementById('editSteps').value.split('\n').filter(l => l.trim())
    };

    if (id) {
        const idx = recipes.findIndex(x => x.id == id);
        recipes[idx] = newRecipe;
    } else {
        recipes.push(newRecipe);
    }

    localStorage.setItem('chef_v1_0_6', JSON.stringify(recipes));
    closeModal();
    renderGrid();
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            tempImageData = ev.target.result;
            document.getElementById('imgPreview').innerHTML = `<img src="${tempImageData}" style="width:100%; height:100px; object-fit:cover; border-radius:10px; margin-top:10px;">`;
        };
        reader.readAsDataURL(file);
    }
}

function openModal(id = null) {
    document.getElementById('editId').value = "";
    document.getElementById('editTitle').value = "";
    document.getElementById('editIng').value = "";
    document.getElementById('editSteps').value = "";
    document.getElementById('imgPreview').innerHTML = "";
    tempImageData = "";

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

function viewRecipe(id) {
    const r = recipes.find(x => x.id == id);
    const content = document.getElementById('viewAreaContent');
    content.innerHTML = `
        <img src="${r.img}" style="width:100%; border-radius:15px;">
        <h2>${r.title}</h2>
        <p><b>${r.category}</b></p>
        <p>${r.ingredients.join('<br>')}</p>
        <hr>
        <p>${r.instructions.join('<br>')}</p>
        <button onclick="shareToWhatsApp('${r.id}')" style="background:#25D366; color:white; width:100%; padding:15px; border:none; border-radius:10px; font-weight:bold;">שתף בווטסאפ 💬</button>
    `;
    document.getElementById('recipeView').classList.remove('hidden');
}

function shareToWhatsApp(id) {
    const r = recipes.find(x => x.id == id);
    const text = `*${r.title}*%0A${r.ingredients.join('%0A')}`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function deleteRecipe(id) {
    if(confirm('למחוק?')) {
        recipes = recipes.filter(r => r.id != id);
        localStorage.setItem('chef_v1_0_6', JSON.stringify(recipes));
        renderGrid();
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

function exportData() {
    const blob = new Blob([JSON.stringify({recipes, shoppingList})], {type: 'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'chef_backup.json'; a.click();
}

window.onload = () => renderGrid();
