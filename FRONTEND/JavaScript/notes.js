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

const injectStyles = () => {
    if (document.getElementById('theme-styles')) return;
    const style = document.createElement('style');
    style.id = 'theme-styles';
    style.innerHTML = `
        body { transition: background 0.3s ease; }
        
        /* Navbar Hover */
        .nav-item { transition: color 0.3s ease !important; cursor: pointer; text-decoration: none; }
        .nav-item:hover { color: #007bff !important; }

        /* DARK MODE - Core Colors */
        body.dark-mode { background-color: #0f172a !important; }
        body.dark-mode .navbar { background: #1e293b !important; border-bottom: 1px solid #334155 !important; }
        body.dark-mode .nav-item { color: #f8fafc !important; }
        body.dark-mode h1, body.dark-mode h3:not(.card-title), body.dark-mode .h1 { color: #ffffff !important; }

        /* UPLOAD FORM DARK MODE FIX */
        body.dark-mode .main-login, body.dark-mode .upload-container { 
            background: #1e293b !important; 
            border: 1px solid #334155 !important; 
            color: white !important; 
        }
        body.dark-mode input, body.dark-mode textarea { 
            background: #0f172a !important; 
            border: 1px solid #334155 !important; 
            color: white !important; 
        }

        /* --- CARD TITLE & BUTTON FIX --- */
        .card { background: white !important; border-radius: 12px; overflow: hidden; }
        
        /* Isse title aur text hamesha visible rahenge */
        .card-title, .card-text, .card-body b { 
            color: #1e293b !important; 
            background: transparent !important; 
        }

        .card-actions button i {
            background: transparent !important;
            border: none !important;
            margin-right: 5px !important;
            display: inline-block !important;
        }

        .card-actions button {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            color: white !important;
            border: none !important;
            padding: 8px 15px !important;
            border-radius: 6px !important;
            cursor: pointer;
        }

        .view-btn { background-color: #007bff !important; }
        .edit-btn { background-color: #27ae60 !important; }
        .del-btn { background-color: #dc3545 !important; }
        
        /* Bottom Section Visibility */
        .fut { padding: 40px; text-align: center; }
        body.dark-mode .fut { background: #1e293b; color: white; }
    `;
    document.head.appendChild(style);
};

const applySavedTheme = () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
};

function showPopup(message, type = 'success') {
    const icon = type === 'success' ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';
    popup.innerHTML = `${icon} ${message}`;
    popup.className = `popup show ${type}`;
    setTimeout(() => popup.classList.remove('show'), 3000);
}

function renderNoteCard(note) {
    if (!note || !note._id) return;
    const card = document.createElement("div");
    card.classList.add("card");
    const fullFilePath = note.filePath ? `https://unisync-backend-final.vercel.app/${note.filePath}` : null;

    card.innerHTML = `
        <img src="./assets/default-note.png" class="card-img" alt="Note" style="width:100%; height:180px; object-fit:contain; padding:10px;">
        <div class="card-body" style="padding:15px; background: white;">
            <h3 class="card-title" style="margin-top:0; font-size:1.2rem; font-weight:bold;">📘 ${note.title}</h3>
            <p class="card-text" style="margin:8px 0;"><b>Subject:</b> ${note.subject}</p>
            <p class="card-text" style="font-size:0.9rem; color:#666;">${note.description || "No description"}</p>
            <div class="card-actions" style="display:flex; gap:10px; margin-top:15px;">
                ${fullFilePath ? `<button class="view-btn"><i class="fa-solid fa-eye"></i> View</button>` : `<button disabled>No File</button>`}
                <button class="edit-btn"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="del-btn"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
        </div>
    `;

    if (fullFilePath) card.querySelector(".view-btn").onclick = () => window.open(fullFilePath, "_blank");
    card.querySelector(".del-btn").onclick = () => openDeleteConfirmation(note._id);
    card.querySelector(".edit-btn").onclick = () => openEditPopup(note);
    notesContainer.appendChild(card);
}

async function getNotes() {
    const token = localStorage.getItem('token');
    if(!token) {
        notesContainer.innerHTML = "<p style='color: white;'>Please login to see your notes.</p>";
        return;
    }

    notesContainer.innerHTML = "<p style='color: white;'>Loading your notes...</p>";

    const res = await fetch(baseURL, { 
        headers: { 'Authorization': `Bearer ${token}` } 
    });

    if (res.ok) {
        const data = await res.json();
        notesContainer.innerHTML = ""; 
        
        if (data.length === 0) {
            notesContainer.innerHTML = "<p style='color: white;'>No notes found for your account.</p>";
        } else {
            data.forEach(renderNoteCard);
        }
    } else {
        notesContainer.innerHTML = "<p style='color: red;'>Failed to load notes.</p>";
    }
}

function createEditModal() {
    editModal = document.createElement('div');
    editModal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:none; justify-content:center; align-items:center; z-index:9999;";
    editModal.innerHTML = `
        <div style="background:white; padding:25px; border-radius:12px; width:90%; max-width:450px; font-family:'Poppins';">
            <h3 style="margin-bottom:20px; color:#333;">📝 Edit Note Details</h3>
            <input type="text" id="editTitle" placeholder="Title" style="width:100%; padding:12px; margin-bottom:15px; border:1px solid #ddd; border-radius:8px; color:black !important; background:white !important;">
            <input type="text" id="editSubject" placeholder="Subject" style="width:100%; padding:12px; margin-bottom:15px; border:1px solid #ddd; border-radius:8px; color:black !important; background:white !important;">
            <textarea id="editDesc" placeholder="Description" rows="4" style="width:100%; padding:12px; margin-bottom:20px; border:1px solid #ddd; border-radius:8px; color:black !important; background:white !important;"></textarea>
            <div style="display:flex; gap:12px;">
                <button id="saveEdit" style="flex:2; background:#27ae60; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;">Save Changes</button>
                <button id="cancelEdit" style="flex:1; background:#f1f1f1; color:#333; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;">Cancel</button>
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
    document.getElementById('editTitle').value = note.title || '';
    document.getElementById('editSubject').value = note.subject || '';
    document.getElementById('editDesc').value = note.description || '';
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    });
    if (res.ok) {
        showPopup("Notes Updated Successfully!", "success");
        getNotes();
        editModal.style.display = 'none';
    }
}

function openDeleteConfirmation(noteId) {
    if (!deleteModal) {
        deleteModal = document.createElement('div');
        deleteModal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:none; justify-content:center; align-items:center; z-index:9999;";
        deleteModal.innerHTML = `
            <div style="background:white; padding:30px; border-radius:15px; text-align:center; width:350px;">
                <h3 style="color: black">🗑️ Confirm Deletion</h3>
                <p style="color: #666">Are you sure you want to delete this note?</p>
                <div style="margin-top:25px; display:flex; gap:12px;">
                    <button id="confirmDel" style="flex:1; padding:12px; background:#dc3545; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">Delete</button>
                    <button id="cancelDel" style="flex:1; padding:12px; background:#eee; color:#333; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(deleteModal);
    }
    deleteModal.style.display = 'flex';
    document.getElementById('cancelDel').onclick = () => deleteModal.style.display = 'none';
    document.getElementById('confirmDel').onclick = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseURL}/${noteId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            showPopup("Notes Deleted Successfully!", "success");
            getNotes();
        }
        deleteModal.style.display = 'none';
    };
}

submitBtn.onclick = async (e) => {
    e.preventDefault();
    if (!titleInput.value || !realFileInput.files[0]) {
        showPopup("Please Enter all the fields!", "info");
        return;
    }
    const formData = new FormData();
    formData.append('title', titleInput.value);
    formData.append('subject', subjectInput.value);
    formData.append('description', descInput.value);
    formData.append('noteFile', realFileInput.files[0]);

    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading...";

    const res = await fetch(baseURL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
    });

    if (res.ok) {
        showPopup("Notes Added Successfully!", "success");
        getNotes();
        titleInput.value = ''; subjectInput.value = ''; descInput.value = ''; 
        realFileInput.value = ''; browseBtnTemp.textContent = 'Browse';
    }
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
};

// Initial Calls
document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    applySavedTheme();
    getNotes();
});
// Bottom Upload button logic
const bottomAddBtn = document.getElementById("bottom-add-btn");

if (bottomAddBtn) {
    bottomAddBtn.onclick = () => {
        // Form wale section tak smooth scroll karke le jayega
        document.querySelector(".main-login").scrollIntoView({ 
            behavior: "smooth", 
            block: "center" 
        });
        
        // Title input par focus kar dega taaki user turant likhna shuru kar sake
        titleInput.focus();
    };
}

browseBtnTemp.onclick = () => realFileInput.click();

realFileInput.onchange = () => { if(realFileInput.files[0]) browseBtnTemp.textContent = realFileInput.files[0].name; };


