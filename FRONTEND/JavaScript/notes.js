const baseURL = 'https://unisync-backend-final.vercel.app/api/notes';
const notesContainer = document.querySelector(".card-container");
const realFileInput = document.getElementById("realFileInput");
const browseBtnTemp = document.getElementById("browse-btn-temp");
const submitBtn = document.getElementById("submit-btn");
const titleInput = document.getElementById("noteTitle");
const subjectInput = document.getElementById("noteSubject");
const descInput = document.getElementById("noteDescription");
const popup = document.getElementById('popup');

let deleteModal = null;
let editModal = null;
let currentNoteId = null;

// --- 1. THEME & STYLES (A TO Z) ---
const injectStyles = () => {
    if (document.getElementById('theme-styles')) return;
    const style = document.createElement('style');
    style.id = 'theme-styles';
    style.innerHTML = `
        body { transition: background 0.3s ease, color 0.3s ease; }
        
        /* DARK MODE CORE */
        body.dark-mode { background-color: #0f172a !important; color: #ffffff !important; }
        body.dark-mode .navbar { background: #1e293b !important; border-bottom: 1px solid #334155 !important; }
        body.dark-mode h1, body.dark-mode h2, body.dark-mode .h1 { color: #ffffff !important; }
        body.dark-mode .nav-item { color: #f8fafc !important; }

        /* UPLOAD SECTION DARK MODE */
        body.dark-mode .main-login, body.dark-mode .upload-container { 
            background: #1e293b !important; 
            border: 1px solid #334155 !important; 
            color: white !important; 
        }
        body.dark-mode input, body.dark-mode textarea { 
            background: #0f172a !important; 
            border: 1px solid #475569 !important; 
            color: white !important; 
        }

        /* CARD STYLE - Notes White hi rahenge */
        .card { 
            background: #ffffff !important; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .card-body { background: #ffffff !important; color: #1e293b !important; padding: 15px; }
        .card-title { color: #1e293b !important; font-weight: bold; margin-bottom: 10px; }
        .card-text { color: #475569 !important; margin-bottom: 5px; }

        /* BUTTONS */
        .card-actions { display: flex; gap: 8px; margin-top: 15px; }
        .card-actions button { 
            flex: 1; border: none; padding: 10px; border-radius: 6px; 
            cursor: pointer; color: white; font-weight: 600; font-size: 0.8rem;
            display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .view-btn { background: #3b82f6 !important; }
        .edit-btn { background: #10b981 !important; }
        .del-btn { background: #ef4444 !important; }

        /* MODALS */
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.75); display: none; justify-content: center; 
            align-items: center; z-index: 10000;
        }
    `;
    document.head.appendChild(style);
};

// --- 2. CORE LOGIC ---

const applySavedTheme = () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
};

function showPopup(message, type = 'success') {
    const icon = type === 'success' ? '✅' : '⚠️';
    popup.innerHTML = `${icon} ${message}`;
    popup.className = `popup show ${type}`;
    setTimeout(() => popup.classList.remove('show'), 3000);
}

// Render Card with Cloudinary Fix
function renderNoteCard(note) {
    if (!note || !note._id) return;
    const card = document.createElement("div");
    card.classList.add("card");

    const filePath = note.filePath || null;

    card.innerHTML = `
        <img src="./assets/default-note.png" class="card-img" alt="Note" style="width:100%; height:160px; object-fit:contain; padding:10px; background:#f1f5f9;">
        <div class="card-body">
            <h3 class="card-title">📘 ${note.title}</h3>
            <p class="card-text"><b>Subject:</b> ${note.subject}</p>
            <p class="card-text" style="font-size:0.85rem; height:40px; overflow:hidden;">${note.description || "No description provided."}</p>
            <div class="card-actions">
                <button class="view-btn"><i class="fa-solid fa-eye"></i> View</button>
                <button class="edit-btn"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="del-btn"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
        </div>
    `;

    card.querySelector(".view-btn").onclick = () => filePath ? window.open(filePath, "_blank") : alert("No file found");
    card.querySelector(".edit-btn").onclick = () => openEditPopup(note);
    card.querySelector(".del-btn").onclick = () => openDeleteConfirmation(note._id);
    
    notesContainer.appendChild(card);
}

// Get All Notes
async function getNotes() {
    const token = localStorage.getItem('token');
    if(!token) return notesContainer.innerHTML = "<p>Please login first.</p>";
    
    notesContainer.innerHTML = "<p>Loading notes...</p>";
    try {
        const res = await fetch(baseURL, { headers: { 'x-auth-token': token } });
        const data = await res.json();
        notesContainer.innerHTML = "";
        if (res.ok && data.length > 0) {
            data.forEach(renderNoteCard);
        } else {
            notesContainer.innerHTML = "<p>No notes available.</p>";
        }
    } catch (err) {
        notesContainer.innerHTML = "<p>Error connecting to server.</p>";
    }
}

// --- 3. EDIT & DELETE MODALS ---

function createEditModal() {
    editModal = document.createElement('div');
    editModal.className = 'modal-overlay';
    editModal.innerHTML = `
        <div style="background:white; padding:25px; border-radius:12px; width:90%; max-width:400px; color:#333;">
            <h3 style="margin-bottom:15px;">📝 Edit Note</h3>
            <input type="text" id="editTitle" placeholder="Title" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:5px; color:black;">
            <input type="text" id="editSubject" placeholder="Subject" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #ccc; border-radius:5px; color:black;">
            <textarea id="editDesc" placeholder="Description" rows="4" style="width:100%; padding:10px; margin-bottom:15px; border:1px solid #ccc; border-radius:5px; color:black;"></textarea>
            <div style="display:flex; gap:10px;">
                <button id="saveEdit" style="flex:1; background:#10b981; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer;">Save</button>
                <button id="cancelEdit" style="flex:1; background:#94a3b8; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer;">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(editModal);
    document.getElementById('cancelEdit').onclick = () => editModal.style.display = 'none';
    document.getElementById('saveEdit').onclick = handleSaveEdit;
}

function openEditPopup(note) {
    if (!editModal) createEditModal();
    currentNoteId = note._id;
    document.getElementById('editTitle').value = note.title;
    document.getElementById('editSubject').value = note.subject;
    document.getElementById('editDesc').value = note.description;
    editModal.style.display = 'flex';
}

async function handleSaveEdit() {
    const token = localStorage.getItem('token');
    const updatedData = {
        title: document.getElementById('editTitle').value.trim(),
        subject: document.getElementById('editSubject').value.trim(),
        description: document.getElementById('editDesc').value.trim()
    };

    const res = await fetch(`${baseURL}/${currentNoteId}`, {
        method: 'PUT',
        headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    });

    if (res.ok) {
        showPopup("Note updated!", "success");
        editModal.style.display = 'none';
        getNotes();
    }
}

function openDeleteConfirmation(noteId) {
    if (confirm("Are you sure you want to delete this note?")) {
        const token = localStorage.getItem('token');
        fetch(`${baseURL}/${noteId}`, { 
            method: 'DELETE', 
            headers: { 'x-auth-token': token } 
        }).then(res => {
            if(res.ok) {
                showPopup("Deleted!", "success");
                getNotes();
            }
        });
    }
}

// --- 4. UPLOAD LOGIC ---

submitBtn.onclick = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!titleInput.value || !realFileInput.files[0]) return showPopup("Fill all fields!", "info");

    const formData = new FormData();
    formData.append('title', titleInput.value);
    formData.append('subject', subjectInput.value);
    formData.append('description', descInput.value);
    formData.append('noteFile', realFileInput.files[0]);

    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading...";

    const res = await fetch(baseURL, {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: formData
    });

    if (res.ok) {
        showPopup("Note Added!", "success");
        titleInput.value = ''; subjectInput.value = ''; descInput.value = '';
        realFileInput.value = ''; browseBtnTemp.textContent = 'Browse';
        getNotes();
    }
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
};

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    applySavedTheme();
    getNotes();
});

browseBtnTemp.onclick = () => realFileInput.click();
realFileInput.onchange = () => { if(realFileInput.files[0]) browseBtnTemp.textContent = realFileInput.files[0].name; };

