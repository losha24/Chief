const DB_NAME = 'chef_v211_data';
const SHOP_NAME = 'chef_v211_shop';

const initialRecipes = [
    { id: "1", title: "שניצל קלאסי", category: "בשרי", ingredients: ["500 גרם חזה עוף פרוס", "1 כוס פירורי לחם", "2 ביצים טרופות", "1/2 כוס קמח", "מלח ופלפל לפי הטעם"], instructions: ["מתבלים את העוף במלח ופלפל.", "טובלים כל פרוסה בקמח, אחר כך בביצה, ולבסוף בפירורי לחם.", "מטגנים בשמן חם עד להזהבה משני הצדדים."] },
    { id: "2", title: "צלי בקר חגיגי", category: "בשרי", ingredients: ["1 ק\"ג נתח בקר לצלייה", "2 בצלים גדולים פרוסים", "3 שיני שום כתושות", "1 כוס יין אדום יבש", "2 כוסות ציר בקר או מים", "תבלינים: מלח, פלפל, עלה דפנה"], instructions: ["מטגנים את הבשר מכל הצדדים בסיר כבד עד לסגירה.", "מוציאים את הבשר, ומטגנים באותו סיר את הבצל והשום.", "מחזירים את הבשר, מוסיפים יין, ציר ותבלינים.", "מביאים לרתיחה, מנמיכים את האש ומבשלים שעתיים וחצי עד שלוש שעות."] },
    { id: "3", title: "לזניה גבינות", category: "חלבי", ingredients: ["1 חבילת דפי לזניה", "500 גרם גבינת קוטג'", "200 גרם גבינה צהובה מרוסקת", "1 מיכל שמנת חמוצה", "1 בקבוק רוטב עגבניות מוכן", "1 כפית אורגנו"], instructions: ["מערבבים בקערה קוטג', שמנת וחצי מכמות הצהובה.", "בתבנית משומנת מסדרים שכבות: רוטב, דפים, תערובת גבינות.", "מסיימים בשכבת דפים, רוטב, ומפזרים את שאר הצהובה.", "אופים בתנור שחומם מראש ל-180 מעלות כ-30 דקות."] },
    { id: "4", title: "שקשוקה בולגרית", category: "חלבי", ingredients: ["4 ביצים", "4 עגבניות בשלות קצוצות", "1 בצל קטן קצוץ", "2 שיני שום", "1 פלפל אדום חתוך", "100 גרם גבינה בולגרית", "תבלינים: פפריקה, מלח"], instructions: ["מטגנים בצל, פלפל ושום במחבת.", "מוסיפים עגבניות ותבלינים ומבשלים 10 דקות.", "יוצרים גומחות ברוטב, שוברים לתוכן את הביצים ומפזרים בולגרית.", "מכסים ומבשלים עד שהביצים מוכנות לפי הטעם."] },
    { id: "5", title: "לחם שום ביתי", category: "מאפים", ingredients: ["1 כיכר לחם פרנה או ג'בטה", "100 גרם חמאה רכה", "4 שיני שום כתושות", "2 כפות פטרוזיליה קצוצה", "מלח גס"], instructions: ["מערבבים חמאה, שום ופטרוזיליה.", "חותכים את הלחם לפרוסות לא עד הסוף.", "מורחים את תערובת החמאה בין הפרוסות.", "עוטפים בנייר כסף ואופים 15 דקות ב-190 מעלות."] },
    { id: "6", title: "בורקס גבינה מהיר", category: "מאפים", ingredients: ["1 חבילת בצק עלים מופשר", "250 גרם גבינה לבנה", "100 גרם גבינה בולגרית מפוררת", "1 ביצה (למילוי)", "1 ביצה טרופה (להברשה)", "שומשום"], instructions: ["מערבבים את חומרי המילוי (גבינות וביצה אחת).", "פותחים את הבצק, חותכים לריבועים.", "מניחים כפית מילוי במרכז כל ריבוע וסוגרים למשולש.", "מברישים בביצה, מפזרים שומשום ואופים 20 דקות ב-200 מעלות."] },
    { id: "7", title: "מוס שוקולד", category: "קינוחים", ingredients: ["200 גרם שוקולד מריר", "1 מיכל שמנת מתוקה (250 מ\"ל)", "3 ביצים (מופרדות)", "2 כפות סוכר"], instructions: ["ממיסים שוקולד במיקרוגל.", "מקציפים חלבונים עם סוכר לקצף יציב.", "בקערה נפרדת מקציפים שמנת מתוקה.", "מערבבים חלמונים לתוך השוקולד המומס.", "מקפלים בעדינות את הקצפת והחלבונים לתוך השוקולד.", "יוצקים לכוסות ומקררים 4 שעות."] },
    { id: "8", title: "עוגיות שוקולד צ'יפס", category: "קינוחים", ingredients: ["1 כוס קמח", "1/2 כוס סוכר חום", "1/2 כוס סוכר לבן", "100 גרם חמאה מומסת", "1 ביצה", "1 כוס שוקולד צ'יפס"], instructions: ["מערבבים חמאה וסוכרים.", "מוסיפים ביצה, קמח ושוקולד צ'יפס.", "יוצרים כדורים ומניחים על תבנית אפייה במרחקים.", "אופים 10-12 דקות ב-180 מעלות עד להזהבה בקצוות."] },
    { id: "9", title: "סלט יווני קלאסי", category: "סלטים", ingredients: ["2 מלפפונים חתוכים", "2 עגבניות חתוכות", "1/2 בצל סגול פרוס", "1/2 כוס זיתי קלמטה", "150 גרם גבינה בולגרית לקוביות", "שמן זית, לימון, אורגנו"], instructions: ["מניחים את הירקות והזיתים בקערה.", "מוסיפים שמן זית, מיץ לימון ואורגנו ומערבבים.", "מניחים את קוביות הבולגרית מעל ומגישים."] },
    { id: "10", title: "סלט כרוב וגזר", category: "סלטים", ingredients: ["1/2 כרוב לבן קצוץ", "2 גזרים מגורדים", "3 כפות מיונז", "1 כף חומץ", "1 כפית סוכר", "מלח ופלפל"], instructions: ["מערבבים בקערה גדולה את הכרוב והגזר.", "בקערה קטנה מערבבים מיונז, חומץ, סוכר ותבלינים.", "יוצקים את הרוטב על הירקות ומערבבים היטב."] },
    { id: "11", title: "פסטה רוזה", category: "פסטות", ingredients: ["1 חבילת פסטה", "1 מיכל שמנת לבישול (250 מ\"ל)", "1 קופסת רסק עגבניות קטנה", "2 שיני שום", "מלח, פלפל, בזיליקום"], instructions: ["מבשלים את הפסטה לפי הוראות היצרן.", "במחבת מטגנים שום, מוסיפים רסק ושמנת ומביאים לרתיחה.", "מתבלים ומבשלים 5 דקות על אש קטנה.", "מערבבים את הפסטה המוכנה עם הרוטב."] },
    { id: "12", title: "פוקצ'ה איטלקית", category: "מאפים", ingredients: ["500 גרם קמח", "1 כף שמרים יבשים", "1 כף סוכר", "1.5 כוסות מים פושרים", "1/4 כוס שמן זית", "מלח גס, רוזמרין"], instructions: ["לשים קמח, שמרים, סוכר, מים ומלח עד לקבלת בצק אחיד.", "מתפיחים שעה במקום חם.", "משטחים על תבנית משומנת, יוצרים גומחות עם האצבעות.", "יוצקים שמן זית, מפזרים מלח גס ורוזמרין ואופים 20 דקות ב-200 מעלות."] }
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
    if(!grid) return;
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
            <strong>📋 מצרכים וכמויות:</strong>
            <ul class="view-list">${r.ingredients.map(i => `<li>${i} <button onclick="addToShop('${i.replace(/'/g,"")}')" class="mini-add">🛒</button></li>`).join('')}</ul>
        </div>
        <div class="view-section">
            <strong>👨‍🍳 הוראות הכנה:</strong>
            <p>${Array.isArray(r.instructions) ? r.instructions.join('<br>') : r.instructions}</p>
        </div>
        <button onclick="shareWA('${r.id}')" class="btn-wa">שתף ב-WhatsApp 💬</button>
    `;
    document.getElementById('recipeView').classList.remove('hidden');
}

function shareWA(id) {
    const r = recipes.find(x => x.id === id);
    const inst = Array.isArray(r.instructions) ? r.instructions.join('%0A') : r.instructions;
    const msg = `*${getIcon(r.category)} מתכון: ${r.title}*%0A%0A*מצרכים וכמויות:*%0A${r.ingredients.join('%0A')}%0A%0A*הוראות:*%0A${inst}`;
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
    a.download = `chef_backup_v211.json`;
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
        document.getElementById('editIng').value = Array.isArray(r.ingredients) ? r.ingredients.join('\n') : r.ingredients;
        document.getElementById('editSteps').value = Array.isArray(r.instructions) ? r.instructions.join('\n') : r.instructions;
        document.getElementById('modalTitle').innerText = "עריכת מתכון";
    } else {
        document.getElementById('editId').value = "";
        document.getElementById('editTitle').value = "";
        document.getElementById('editIng').value = "";
        document.getElementById('editSteps').value = "";
        document.getElementById('modalTitle').innerText = "מתכון חדש";
    }
    document.getElementById('editModal').classList.remove('hidden');
}

function closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }

window.onload = () => { renderGrid(); if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js'); };
