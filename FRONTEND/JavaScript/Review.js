
const CONFIG = {
    BASE_URL: "http://localhost:8080",
    TOKEN: localStorage.getItem("token")
};

window.downloadReviews = async () => {
    try {
        const res = await fetch(`${CONFIG.BASE_URL}/api/reviews`);
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'unisync_db_backup.json';
        a.click();
        
        window.createPopupTemplate(`
            <h2 style="color:#1e293b; font-weight:900;">✅ BACKUP SAVED</h2>
            <p style="color:#64748b;">Reviews are downloaded from DB.</p>
            <button onclick="closePopup()" style="background:#10b981; color:white; border:none; padding:12px 25px; border-radius:15px; font-weight:800; margin-top:20px; cursor:pointer;">OKAY</button>
        `);
    } catch(err) { console.error(err); }
};

window.uploadReviews = (event) => {
    window.createPopupTemplate(`
        <h2 style="color:#e11d48; font-weight:900;">❌ RESTORE</h2>
        <p style="color:#64748b;">Direct DB restore is restricted for security.</p>
        <button onclick="closePopup()" style="background:#f1f5f9; color:#1e293b; border:none; padding:12px 25px; border-radius:15px; font-weight:800; margin-top:20px; cursor:pointer;">CLOSE</button>
    `);
};

document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); window.downloadReviews(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') { e.preventDefault(); document.getElementById('uploadBack').click(); }
});

window.createPopupTemplate = (content) => {
    const overlay = document.createElement('div');
    overlay.id = "customOverlay";
    overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(10px); z-index:10000; display:flex; justify-content:center; align-items:center; animation: fadeIn 0.3s ease;";
    overlay.innerHTML = `<div class="modal-content-popup-box" style="background:white !important; color:#1e293b !important;">${content}</div>`;
    document.body.appendChild(overlay);
};

window.closePopup = () => {
    const overlay = document.getElementById("customOverlay");
    if(overlay) overlay.remove();
};


window.handleLogout = () => {
    const popupHTML = `
        <h2 style="margin-bottom:10px; font-weight:900; color:#1e293b !important;">LOGOUT?</h2>
        <p style="color:#64748b !important; margin-bottom:20px;">Are you sure you want to leave?</p>
        <div style="display:flex; gap:12px; margin-top:20px;">
            <button id="finalLogoutBtn" style="background:#e11d48; color:white; border:none; padding:12px 0; border-radius:15px; font-weight:800; flex:1; cursor:pointer;">YES, LOGOUT</button>
            <button onclick="closePopup()" style="background:#f1f5f9; color:#0f172a; border:none; padding:12px 0; border-radius:15px; font-weight:800; flex:1; cursor:pointer;">CANCEL</button>
        </div>`;
    window.createPopupTemplate(popupHTML);
    document.getElementById("finalLogoutBtn").onclick = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        window.location.href = "Login.html"; 
    };
};

window.handleDelete = (id) => {
    window.createPopupTemplate(`
        <h2 style="margin-bottom:10px; font-weight:900; color:#1e293b !important;">DELETE?</h2>
        <p style="color:#64748b !important;">Reviews are permanently deleted.</p>
        <div style="display:flex; gap:12px; margin-top:20px;">
            <button id="finalDeleteBtn" style="background:#e11d48; color:white; border:none; padding:12px 0; border-radius:15px; font-weight:800; flex:1; cursor:pointer;">DELETE</button>
            <button onclick="closePopup()" style="background:#f1f5f9; color:#0f172a; border:none; padding:12px 0; border-radius:15px; font-weight:800; flex:1; cursor:pointer;">CANCEL</button>
        </div>`);
    document.getElementById("finalDeleteBtn").onclick = async () => {
        try {
            await fetch(`${CONFIG.BASE_URL}/api/reviews/${id}`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${CONFIG.TOKEN}` }
            });
            location.reload();
        } catch(err) { console.error(err); }
    };
};

window.handleEdit = (id, oldComment, oldRating) => {
    window.tempEditRating = oldRating; 
    window.createPopupTemplate(`
        <h2 style="margin-bottom:15px; font-weight:900; color:#1e293b !important;">EDIT REVIEW</h2>
        <div id="editStarContainer" style="margin-bottom: 20px; display: flex; justify-content: center; gap: 10px; font-size: 2rem;">
            ${[1, 2, 3, 4, 5].map(num => `<i class="fa-solid fa-star" data-val="${num}" onclick="window.updateEditStars(${num})" style="cursor:pointer; color: ${num <= oldRating ? '#ffc107' : '#cbd5e1'}"></i>`).join('')}
        </div>
        <textarea id="editInput" style="width:100%; height:120px; padding:15px; border-radius:15px; border:2px solid #e2e8f0; margin-bottom:20px; outline:none; resize:none; background:#f8fafc; color:#1e293b; font-family:inherit;"></textarea>
        <div style="display:flex; gap:12px;">
            <button id="finalSaveBtn" style="background:#2563eb; color:white; border:none; padding:12px 0; border-radius:15px; font-weight:800; flex:1; cursor:pointer;">SAVE</button>
            <button onclick="closePopup()" style="background:#f1f5f9; color:#0f172a; border:none; padding:12px 0; border-radius:15px; font-weight:800; flex:1; cursor:pointer;">CANCEL</button>
        </div>`);

    document.getElementById("editInput").value = oldComment;

    document.getElementById("finalSaveBtn").onclick = async () => {
        const comment = document.getElementById("editInput").value;
        try {
            await fetch(`${CONFIG.BASE_URL}/api/reviews/${id}`, {
                method: 'PUT',
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${CONFIG.TOKEN}` 
                },
                body: JSON.stringify({ comment, rating: window.tempEditRating })
            });
            location.reload();
        } catch(err) { console.error(err); }
    };
};

window.updateEditStars = (rating) => {
    window.tempEditRating = rating;
    document.querySelectorAll("#editStarContainer i").forEach(s => {
        s.style.color = s.dataset.val <= rating ? "#ffc107" : "#cbd5e1";
    });
};

document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = localStorage.getItem("userName") || "User"; 
    const reviewsDisplay = document.getElementById("reviewsDisplay");
    const stars = document.querySelectorAll("#starContainer i");
    let currentRating = 0;

    const loadReviews = async () => {
        try {
            const res = await fetch(`${CONFIG.BASE_URL}/api/reviews`);
            const saved = await res.json();
            
            reviewsDisplay.innerHTML = saved.map(rev => {
                const authorName = rev.user ? rev.user.username : "Anonymous";
                const isOwner = authorName === loggedInUser;
                const initial = authorName.charAt(0).toUpperCase();
                const safeComment = rev.comment.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\n/g, '\\n');
                
                return `
                <div class="og-review-card">
                    <div class="card-top">
                        <div class="user-info">
                            <div class="og-avatar">${initial}</div>
                            <div class="og-user-details">
                                <h4 class="og-name">${authorName} ${isOwner ? '<span class="og-you-badge">You</span>' : ''}</h4>
                                <span class="og-date">${new Date(rev.date).toLocaleDateString('en-GB')}</span>
                            </div>
                        </div>
                        ${isOwner ? `
                        <div class="og-action-group">
                            <button 
    class="action-btn-modern edit" 
    data-id="${rev._id}"
    data-comment="${encodeURIComponent(rev.comment)}"
    data-rating="${rev.rating}">

                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="action-btn-modern delete" onclick="window.handleDelete('${rev._id}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>` : ''}
                    </div>
                    <div class="og-stars">${'<i class="fa-solid fa-star"></i>'.repeat(rev.rating)}</div>
                    <div class="og-comment-box"><p>"${rev.comment}"</p></div>
                </div>`;
            }).join('');
            injectOGCSS();
            document.querySelectorAll(".action-btn-modern.edit").forEach(btn => {
    btn.onclick = () => {
        console.log("EDIT BUTTON CLICKED");

        const id = btn.dataset.id;
        const comment = decodeURIComponent(btn.dataset.comment);
        const rating = parseInt(btn.dataset.rating);
        window.handleEdit(id, comment, rating);
    };
});
        } catch (err) { console.error("Load Error:", err); }
    };

    const hiddenUpload = document.createElement("input");
    hiddenUpload.type = "file";
    hiddenUpload.id = "uploadBack";
    hiddenUpload.style.display = "none";
    hiddenUpload.onchange = (e) => window.uploadReviews(e);
    document.body.appendChild(hiddenUpload);

    const logoutBtn = document.getElementById("logoutTopBtn");
    const themeBtn = document.createElement("button");
    themeBtn.id = "themeToggle";
    themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    themeBtn.style = "background:none; border:none; font-size:1.2rem; cursor:pointer; color:inherit; display:flex; align-items:center; margin-right: -5px;";
    
    if(logoutBtn && logoutBtn.parentElement) {
        logoutBtn.parentElement.style.display = "flex";
        logoutBtn.parentElement.style.alignItems = "center";
        logoutBtn.parentElement.style.gap = "10px";
        logoutBtn.parentElement.prepend(themeBtn);
    }

    const toggleTheme = () => {
        const isDark = document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        themeBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    };
    if(localStorage.getItem("theme") === "dark") toggleTheme();
    themeBtn.onclick = toggleTheme;

    if(logoutBtn) logoutBtn.onclick = (e) => { e.preventDefault(); window.handleLogout(); };

    stars.forEach(star => {
        star.onclick = () => {
            currentRating = star.dataset.value;
            stars.forEach(s => s.style.color = s.dataset.value <= currentRating ? "#ffc107" : "#cbd5e1");
            document.getElementById("ratingValue").innerText = `Rating: ${currentRating}/5`;
        };
    });

    document.getElementById("submitReviewBtn").onclick = async () => {
        const feedbackVal = document.getElementById("userFeedback").value;
        if (!feedbackVal.trim() || currentRating === 0) {
            window.createPopupTemplate(`
                <h2 style="color:#e11d48; font-weight:900;">⚠ OOPS!</h2>
                <p style="color:#64748b;">Rating and writing Review is IMP!</p>
                <button onclick="closePopup()" style="background:#2563eb; color:white; border:none; padding:12px 25px; border-radius:15px; font-weight:800; margin-top:20px; cursor:pointer;">GOT IT</button>
            `);
            return;
        }

        try {
            const res = await fetch(`${CONFIG.BASE_URL}/api/reviews`, {
                method: 'POST',
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${CONFIG.TOKEN}` 
                },
                body: JSON.stringify({ rating: currentRating, comment: feedbackVal })
            });

            if(res.ok) {
                document.getElementById("userFeedback").value = ""; 
                currentRating = 0; 
                document.querySelectorAll("#starContainer i").forEach(s => s.style.color = "#cbd5e1"); 
                loadReviews(); 
            }
            else alert("Session expired or Error. Please login again.");
        } catch(err) { console.error(err); }
    };

    function injectOGCSS() {
        if(document.getElementById("og-css")) return;
        const style = document.createElement('style');
        style.id = "og-css";
        style.innerHTML = `
            body.dark-mode { background-color: #0f172a !important; color: #ffffff !important; }
            body.dark-mode .navbar, 
            body.dark-mode .review-card, 
            body.dark-mode .og-review-card { background-color: #1e293b !important; border-color: #334155 !important; color: #ffffff !important; }
            body.dark-mode .og-name { color: white !important; }
            body.dark-mode textarea, body.dark-mode input { background: #0f172a !important; color: white !important; border-color: #334155 !important; }
            body.dark-mode .og-comment-box { background: #334155 !important; }
            body.dark-mode .og-comment-box p { color: #e2e8f0 !important; font-style: italic !important; }
            .og-comment-box p { font-style: italic !important; margin: 0; }
            body.dark-mode .footer { background-color: #f1f5f9 !important; color: #0f172a !important; }
            .modal-content-popup-box { background:white; padding:35px; border-radius:30px; text-align:center; max-width:400px; width:90%; box-shadow:0 25px 50px rgba(0,0,0,0.3); z-index: 10001; }
            .og-review-card { background: white; border-radius: 30px; padding: 25px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #eee; position: relative; text-align: left; }
            .og-review-card::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 8px; background: linear-gradient(90deg, #6366f1, #a855f7); }
            .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
            .user-info { display: flex; align-items: center; gap: 12px; }
            .og-name { margin: 0; display: flex; align-items: center; }
            .og-you-badge { background: rgba(99, 102, 241, 0.1); color: #6366f1; padding: 3px 12px; border-radius: 50px; font-size: 0.7rem; font-weight: 800; margin-left: 10px; border: 1px solid rgba(99, 102, 241, 0.2); text-transform: uppercase; }
            body.dark-mode .og-you-badge { background: rgba(165, 180, 252, 0.2); color: #a5b4fc; }
            .og-stars { color: #ffc107 !important; font-size: 1rem; margin-bottom: 10px; }
            .og-avatar { width: 50px; height: 50px; background: linear-gradient(135deg, #4f46e5, #9333ea); color: white; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-weight: 800; }
            .og-action-group { display: flex; gap: 8px; align-items: center; }
            .action-btn-modern { width: 32px; height: 32px; border-radius: 10px; border: none; cursor: pointer; transition: 0.2s; background: #f1f5f9; color: #475569; }
            .og-comment-box { background: #f8fafc; padding: 20px; border-radius: 20px; border-left: 4px solid #4f46e5; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `;
        document.head.appendChild(style);
    }

    loadReviews();
});