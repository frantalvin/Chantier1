// Clé de stockage pour le ciment
const STORAGE_KEY = 'chantierCiment';

// Chargement des données existantes ou initialisation
let cementUsage = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Références DOM
const form = document.getElementById('cementForm');
const tbody = document.getElementById('tableBody');
const totalDisplay = document.getElementById('totalDisplay');

// --- Affichage du tableau et du total ---
function renderTable() {
    if (cementUsage.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-message">Aucune consommation enregistrée</td></tr>`;
        totalDisplay.textContent = 'Total sacs utilisés : 0';
        return;
    }

    // Trier par date (du plus récent au plus ancien)
    const sorted = [...cementUsage].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Construction des lignes
    tbody.innerHTML = sorted.map((item, index) => {
        // On a besoin de l'index original pour la suppression
        const originalIndex = cementUsage.findIndex(el => 
            el.date === item.date && 
            el.quantity === item.quantity && 
            el.type === item.type && 
            el.supplier === item.supplier && 
            el.comment === item.comment
        );
        return `<tr>
            <td>${escapeHTML(item.date)}</td>
            <td>${escapeHTML(item.quantity)}</td>
            <td>${escapeHTML(item.type || '-')}</td>
            <td>${escapeHTML(item.supplier || '-')}</td>
            <td>${escapeHTML(item.comment || '-')}</td>
            <td>
                <button class="delete-btn" data-index="${originalIndex}">Supprimer</button>
            </td>
        </tr>`;
    }).join('');

    // Écouteurs sur les boutons supprimer
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            deleteItem(index);
        });
    });

    // Mise à jour du total
    const total = cementUsage.reduce((acc, curr) => acc + Number(curr.quantity), 0);
    totalDisplay.textContent = `Total sacs utilisés : ${total.toFixed(1)}`;
}

// --- Supprimer un enregistrement ---
function deleteItem(index) {
    cementUsage.splice(index, 1);
    saveAndRender();
}

// --- Sauvegarde + rafraîchissement ---
function saveAndRender() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cementUsage));
    renderTable();
}

// --- Échappement HTML (sécurité) ---
function escapeHTML(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// --- Gestion du formulaire ---
form.addEventListener('submit', function(e) {
    e.preventDefault();

    const newEntry = {
        date: document.getElementById('date').value,
        quantity: parseFloat(document.getElementById('quantity').value),
        type: document.getElementById('type').value,
        supplier: document.getElementById('supplier').value.trim(),
        comment: document.getElementById('comment').value.trim()
    };

    // Validation rapide
    if (!newEntry.date || isNaN(newEntry.quantity) || newEntry.quantity <= 0) {
        alert('Veuillez remplir la date et une quantité valide.');
        return;
    }

    cementUsage.push(newEntry);
    saveAndRender();

    // Réinitialisation du formulaire, mais on garde la date du jour
    form.reset();
    document.getElementById('date').valueAsDate = new Date();
});

// --- Initialisation : pré-remplir la date du jour ---
window.addEventListener('DOMContentLoaded', function() {
    document.getElementById('date').valueAsDate = new Date();
    renderTable();
});

