document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    const apiURL = 'https://unisync-backend-final.vercel.app/api/auth';

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    const showPopup = (title, message, isConfirm = false, onConfirm = null) => {
        const overlay = document.createElement("div");
        overlay.style = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); 
                         backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; z-index:10000; font-family:'Poppins',sans-serif;`;
        const box = document.createElement("div");
        box.style = `background:white; padding:30px; border-radius:20px; width:350px; text-align:center; box-shadow:0 20px 40px rgba(0,0,0,0.4); transform:scale(0.8); transition:0.3s forwards;`;
        box.innerHTML = `
            <h3 style="margin:0 0 10px 0; color:#333;">${title}</h3>
            <p style="color:#666; margin-bottom:25px;">${message}</p>
            <div style="display:flex; gap:10px; justify-content:center;">
                ${isConfirm ? `<button id="popCancel" style="padding:10px 20px; border:none; background:#eee; border-radius:10px; cursor:pointer; font-weight:600;">Cancel</button>` : ''}
                <button id="popOk" style="padding:10px 25px; border:none; background:#2ecc71; color:white; border-radius:10px; cursor:pointer; font-weight:600;">${isConfirm ? 'Yes, Logout' : 'Got it'}</button>
            </div>
        `;
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        setTimeout(() => box.style.transform = "scale(1)", 10);
        document.getElementById("popOk").onclick = () => { overlay.remove(); if(onConfirm) onConfirm(); };
        if(isConfirm) document.getElementById("popCancel").onclick = () => overlay.remove();
    };

     const injectStyles = () => {
        if (!document.getElementById('profile-dynamic-styles')) {
            const style = document.createElement('style');
            style.id = 'profile-dynamic-styles';
            style.innerHTML = `
                /* --- VISIBILITY FIX FOR PROFILE INFO --- */
                /* Hamesha visible rakhne ke liye dark gray/black colors */
                #dispName { 
                    color: #1e293b !important; 
                    font-weight: 800 !important; 
                    display: block !important;
                    visibility: visible !important;
                }
                #dispEmail, #dispBranch { 
                    color: #334155 !important; 
                    font-weight: 600 !important; 
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    visibility: visible !important;
                }
                #dispEmail i, #dispBranch i {
                    color: #3b82f6 !important; /* Icons ko blue rakha hai visibility ke liye */
                    margin-right: 8px;
                }
                
                /* Dark mode mein bhi inko readable rakha hai */
                body.dark-mode #dispName { color: #1e293b !important; }
                body.dark-mode #dispEmail, body.dark-mode #dispBranch { color: #334155 !important; }

                /* Baaki saari purani styling untouched */
                body.dark-mode { background-color: #0f172a !important; color: #f8fafc !important; }
                body.dark-mode .navbar, body.dark-mode .dashboard-box, body.dark-mode .stat-card { 
                    background-color: #1e293b !important; color: #f8fafc !important; border-color: #334155 !important; 
                }
                .status-popup {
                    position: fixed; top: -100px; left: 50%; transform: translateX(-50%);
                    min-width: 320px; padding: 15px 30px; border-radius: 50px;
                    background: linear-gradient(135deg, #2ecc71, #27ae60);
                    color: white; font-weight: 600; z-index: 10000;
                    transition: 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                    display: flex; align-items: center; justify-content: center; gap: 12px;
                }
                .status-popup.show { top: 30px; }
                
                .edit-modal-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:20000; backdrop-filter:blur(4px); }
                .edit-modal-box { background:white; padding:25px; border-radius:20px; width:90%; max-width:400px; box-shadow:0 15px 30px rgba(0,0,0,0.2); animation: popIn 0.3s ease-out; }
                @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .edit-modal-box h3 { margin-bottom:20px; color:#1e293b; font-size:1.5rem; text-align:center; }
                .input-group { text-align:left; margin-bottom:15px; }
                .input-group label { display:block; margin-bottom:5px; font-weight:600; color:#64748b; font-size:0.9rem; }
                .input-group input { width:100%; padding:12px; border:2px solid #e2e8f0; border-radius:12px; outline:none; transition:0.3s; box-sizing: border-box; }
                .input-group input:focus { border-color:#3b82f6; }

                .stat-card h3, .stat-card h4, .stat-card p, .stat-card span { color: #359681 !important; font-weight: 600; }
                .stat-card .stat-info { color: #761515 !important; }
                .dashboard-box h2, .dashboard-box h3 { color: #c63333 !important; font-weight: 700; }

                .logout-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.6); display: flex; align-items: center;
                    justify-content: center; z-index: 100000; font-family: 'Poppins', sans-serif;
                    backdrop-filter: blur(4px);
                }
                .logout-box {
                    background: white; padding: 35px 25px; border-radius: 25px;
                    width: 380px; text-align: center; box-shadow: 0 15px 45px rgba(0,0,0,0.3);
                }
                .logout-box h2 { font-weight: 800; font-size: 1.7rem; margin: 0 0 8px 0; color: #000 !important; }
                .logout-box p { color: #4b5563 !important; margin-bottom: 25px; font-size: 1.05rem; font-weight: 500; }
                .logout-buttons { display: flex; gap: 12px; justify-content: center; }
                .btn-exit { flex: 1; padding: 14px; background: #e32626; color: white !important; border-radius: 15px; border: none; font-weight: 700; cursor: pointer; }
                .btn-stay { flex: 1; padding: 14px; background: #f3f4f6; color: #1f2937 !important; border-radius: 15px; border: none; font-weight: 700; cursor: pointer; }
            `;
            document.head.appendChild(style);
        }
    };
               
    const initTheme = () => {
    const toggleBtn = document.getElementById('theme-toggle-btn');

    const applyTheme = () => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');
    };

    applyTheme();

    const updateIcon = () => {
        if (!toggleBtn) return;
        const isDark = document.body.classList.contains('dark-mode');
        toggleBtn.innerHTML = isDark 
            ? '<i class="fa-solid fa-sun"></i>' 
            : '<i class="fa-solid fa-moon"></i>';
    };

    updateIcon();

    if (toggleBtn) {
        toggleBtn.onclick = (e) => {
            e.preventDefault();
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateIcon();
        };
    }
};


    const initSearch = () => {
        const searchInput = document.getElementById("noteSearch");
        if (!searchInput) return;
        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll("#personalNotesContainer .note-item").forEach(note => {
                const title = note.querySelector("h5").innerText.toLowerCase();
                note.style.display = title.includes(term) ? "block" : "none";
            });
        };
    };

    const renderPersonalNotes = async () => {
        const container = document.getElementById("personalNotesContainer");
        if (!container) return;
        container.style.maxHeight = "400px";
        container.style.overflowY = "auto";
        try {
            const res = await fetch('https://unisync-backend-final.vercel.app/api/notes', { headers: { 'x-auth-token': token } });
            const notes = await res.json();
            document.getElementById("statNotes").innerText = notes.length;
            if (notes.length > 0) {
                container.innerHTML = notes.map(note => {
                    const fullFilePath = note.filePath ? note.filePath : "#";
                    return `
                    <div class="note-item" style="margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; cursor: pointer;" 
                             onclick="window.open('${fileUrl}', '_blank', 'noopener,noreferrer')">
                            <i class="fa-solid fa-file-pdf" style="color: #ef4444; font-size: 1.4rem;"></i>
                            <div style="flex: 1; overflow: hidden;">
                                <h5 style="margin: 0; font-size: 1rem; color: #1e293b; font-weight: 700;">${note.title}</h5>
                                <small style="color: #64748b;">${new Date(note.createdAt).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </div>`;
                }).join('');
            }
        } catch (err) { console.error(err); }
    };

    const renderRecentRegistrations = async () => {
        const container = document.getElementById("recentActivityContainer");
        if (!container) return;
        try {
            const res = await fetch('https://unisync-backend-final.vercel.app/api/registrations/my-events', { headers: { 'x-auth-token': token } });
            const registrations = await res.json();
            document.getElementById("statEvents").innerText = registrations.length;
            if (registrations.length > 0) {
                container.innerHTML = registrations.map(reg => {
    const displayStatus = reg.status;
    const statusColor = reg.status === "Paid" ? "#2ecc71" : "#f59e0b";

                    return `
                    <div class="activity-item" style="display: flex; align-items: center; gap: 15px; padding: 12px; border-bottom: 1px solid #f1f5f9;">
                        <i class="fa-solid fa-calendar-check" style="color: #6366f1;"></i>
                        <div style="flex: 1;"><h4 style="margin: 0; font-size: 0.85rem;">${reg.eventId?.title}</h4></div>
                        <span style="font-size: 0.7rem; font-weight: 800; color: ${statusColor}; text-transform: uppercase;">${displayStatus}</span>
                    </div>`;
                }).join('');
            }
        } catch (err) { console.error(err); }
    };


    const initEditProfile = () => {
        const editBtn = document.getElementById("editProfileBtn");
        if (!editBtn) return;
        editBtn.onclick = () => {
            const currentName = document.getElementById("dispName").innerText;
            const currentEmail = document.getElementById("dispEmail").innerText.replace(/envelope| /g, '').trim();
            const currentBranch = document.getElementById("dispBranch").innerText.replace(/graduation-cap| /g, '').trim();
            const modal = document.createElement("div");
            modal.className = "edit-modal-overlay";
            modal.innerHTML = `
                <div class="edit-modal-box">
                    <h3>Update Profile</h3>
                    <div class="input-group"><label>Full Name</label><input type="text" id="eName" value="${currentName}"></div>
                    <div class="input-group"><label>Email Address</label><input type="email" id="eEmail" value="${currentEmail}"></div>
                    <div class="input-group"><label>Branch / Year</label><input type="text" id="eBranch" value="${currentBranch}"></div>
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button id="cEdit" style="flex:1; padding:12px; border:none; border-radius:12px; background:#f1f5f9; cursor:pointer; font-weight:600;">Cancel</button>
                        <button id="sEdit" style="flex:1; padding:12px; border:none; border-radius:12px; background:#3b82f6; color:white; cursor:pointer; font-weight:600;">Save Details</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);
            document.getElementById("cEdit").onclick = () => modal.remove();
            document.getElementById("sEdit").onclick = async () => {
                const updatedData = {
                    name: document.getElementById("eName").value,
                    email: document.getElementById("eEmail").value,
                    branch: document.getElementById("eBranch").value
                };
                const res = await fetch(`${apiURL}/update-profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify(updatedData)
                });
                if (res.ok) {
                    document.getElementById("dispName").innerText = updatedData.name;
                    document.getElementById("dispEmail").innerHTML = `<i class="fa-solid fa-envelope"></i> ${updatedData.email}`;
                    document.getElementById("dispBranch").innerHTML = `<i class="fa-solid fa-graduation-cap"></i> ${updatedData.branch}`;
                    modal.remove();
                    showStatus("Profile Updated!");
                }
            };
        };
    };

    const initCameraLogic = () => {
        const cameraBtn = document.querySelector(".edit-badge") || document.querySelector(".fa-camera")?.parentElement;
        if (!cameraBtn) return;
        const fileInput = document.createElement("input");
        fileInput.type = "file"; fileInput.accept = "image/*"; fileInput.style.display = "none";
        document.body.appendChild(fileInput);
        cameraBtn.onclick = () => fileInput.click();
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file || file.size > 2 * 1024 * 1024) return alert("Select image under 2MB");
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const res = await fetch(`${apiURL}/update-profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify({ profilePic: reader.result })
                });
                if (res.ok) {
                    const data = await res.json();
                    document.getElementById("userAvatar").src = data.profilePic;
                    showStatus("Photo Updated!");
                }
            };
        };
    };

 
    const loadProfile = async () => {
        if (!token) return (window.location.href = "login.html");
        document.getElementById("dispName").innerText = "Loading..."; 
        document.getElementById("dispEmail").innerText = "";
        document.getElementById("dispBranch").innerText = "";
        try {
            const res = await fetch(`${apiURL}/me`, { headers: { 'x-auth-token': token } });
            const user = await res.json();
            document.getElementById("dispName").innerText = user.name || user.username;
            document.getElementById("dispEmail").innerHTML = `<i class="fa-solid fa-envelope"></i> ${user.email}`;
            document.getElementById("dispBranch").innerHTML = `<i class="fa-solid fa-graduation-cap"></i> ${user.branch || 'Not set'}`;
            if(user.profilePic) document.getElementById("userAvatar").src = user.profilePic;
            
            initTheme(); 
            renderPersonalNotes();
            renderRecentRegistrations();
            initSearch();
            initEditProfile();
            initCameraLogic();
        } catch (err) { console.error(err); }
    };

    const showStatus = (msg) => {
        const p = document.createElement("div"); p.className = "status-popup show";
        p.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${msg}`;
        document.body.appendChild(p); setTimeout(() => p.remove(), 3000);
    };

    const initLogout = () => {
        const lgBtn = document.getElementById("logoutTopBtn");
        if(lgBtn) {
            lgBtn.onclick = (e) => {
                e.preventDefault();
                const overlay = document.createElement("div");
                overlay.className = "logout-overlay";
                overlay.innerHTML = `
                    <div class="logout-box">
                        <h2>LOGOUT?</h2>
                        <p>Are you sure you want to leave?</p>
                        <div class="logout-buttons">
                            <button class="btn-exit" id="confirmExit">YES, EXIT</button>
                            <button class="btn-stay" id="cancelExit">STAY</button>
                        </div>
                    </div>`;
                document.body.appendChild(overlay);
                document.getElementById("confirmExit").onclick = () => { localStorage.clear(); window.location.href = "login.html"; };
                document.getElementById("cancelExit").onclick = () => overlay.remove();
            };
        }
    };


    const styleGlobal = document.createElement('style');
    styleGlobal.innerHTML = `
        body { transition: background 0.3s, color 0.3s; }
        footer { background: #f8f9fa; color: #666; padding: 20px; text-align: center; border-top: 1px solid #eee; transition: 0.3s; }
        body.dark-mode footer { background: #1e293b !important; color: #cbd5e1 !important; border-top: 1px solid #334155 !important; }
        #theme-toggle-btn { cursor: pointer; border: none !important; background: none !important; color: #1e293b; font-size: 1.4rem; outline: none; display: flex; padding: 0; }
        body.dark-mode #theme-toggle-btn { color: #facc15 !important; }
    `;
    document.head.appendChild(styleGlobal);

    injectStyles();
    loadProfile();
    initLogout();

});



