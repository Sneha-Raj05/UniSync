document.addEventListener("DOMContentLoaded", () => {
    // 1. --- DARK MODE STYLING (Updated Colors & Hover) ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .dark-mode {
            /* Navbar & Cards color (Deep Blue) */
            --bg-card: #161d2f !important; 
            /* Page Background (Deep Black-Blue) */
            --bg-body: #0b0e14 !important; 
            --text-main: #f1f5f9 !important;
            --text-sub: #94a3b8 !important;
            --border: #232d45 !important;
            --input-bg: #161d2f !important;
            --hover-blue: #3b82f6 !important;
        }

        body.dark-mode { background-color: var(--bg-body); color: var(--text-main); }
        
        /* Navbar styling */
        body.dark-mode .navbar { 
            background: var(--bg-card); 
            border-bottom: 1px solid var(--border); 
        }

        /* Hover Effect for Nav Items */
        body.dark-mode .nav-item { 
            color: var(--text-sub); 
            transition: 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        body.dark-mode .nav-item:hover { 
            color: var(--hover-blue); 
        }

        body.dark-mode .info-card, body.dark-mode .contact-form-section { 
            background: var(--bg-card); 
            border: 1px solid var(--border); 
            color: var(--text-main);
        }
        
        body.dark-mode .input-group input, body.dark-mode .input-group textarea {
            background: var(--input-bg);
            border-color: var(--border);
            color: var(--text-main);
        }
        
        body.dark-mode .input-group label { color: var(--text-main); }
        body.dark-mode .info-card h3 { color: var(--text-main); }
        
        #themeToggle i { cursor: pointer; font-size: 1.2rem; transition: 0.3s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `;
    document.head.appendChild(styleSheet);

    // 2. --- THEME TOGGLE BUTTON ---
    const navRight = document.querySelector(".nav-right");
    if(navRight) {
        navRight.style.display = "flex";
        navRight.style.alignItems = "center";
        navRight.style.gap = "15px";

        const toggleBtn = document.createElement("button");
        toggleBtn.id = "themeToggle";
        toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        toggleBtn.style = "background:none; border:none; color:inherit; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:5px;";
        navRight.prepend(toggleBtn);

        const body = document.body;
        const themeIcon = toggleBtn.querySelector("i");

        if (localStorage.getItem("theme") === "dark") {
            body.classList.add("dark-mode");
            themeIcon.classList.replace("fa-moon", "fa-sun");
            themeIcon.style.color = "#fbbf24";
        }

        toggleBtn.onclick = () => {
            body.classList.toggle("dark-mode");
            const isDark = body.classList.contains("dark-mode");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            
            if (isDark) {
                themeIcon.classList.replace("fa-moon", "fa-sun");
                themeIcon.style.color = "#fbbf24";
            } else {
                themeIcon.classList.replace("fa-sun", "fa-moon");
                themeIcon.style.color = "inherit";
            }
        };
    }

    // 3. --- CUSTOM POPUP LOGIC ---
    window.createPopupTemplate = (content) => {
        const isDark = document.body.classList.contains("dark-mode");
        const overlay = document.createElement('div');
        overlay.id = "customOverlay";
        overlay.style = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); z-index:10000; display:flex; justify-content:center; align-items:center; animation: fadeIn 0.3s ease;`;
        
        overlay.innerHTML = `
            <div style="background:${isDark ? '#161d2f' : 'white'}; color:${isDark ? '#f1f5f9' : '#1e293b'}; padding:35px; border-radius:30px; text-align:center; max-width:400px; width:90%; box-shadow:0 25px 50px rgba(0,0,0,0.5); font-family: sans-serif; border: 1px solid ${isDark ? '#232d45' : '#eee'};">
                ${content}
            </div>`;
        document.body.appendChild(overlay);
    };

    window.closePopup = () => {
        const overlay = document.getElementById("customOverlay");
        if(overlay) overlay.remove();
    };

    // 4. --- LOGOUT LOGIC ---
    window.handleLogout = () => {
        const popupHTML = `
            <h2 style="margin-bottom:10px; font-weight:900;">LOGOUT?</h2>
            <p style="opacity:0.8; margin-bottom:20px;">Are you sure you want to leave?</p>
            <div style="display:flex; gap:12px; margin-top:20px;">
                <button id="confirmLogoutBtn" style="background:#e11d48; color:white; border:none; padding:12px 0; border-radius:15px; font-weight:800; flex:1; cursor:pointer;">YES, LOGOUT</button>
                <button onclick="closePopup()" style="background:#64748b33; color:inherit; border:none; padding:12px 0; border-radius:15px; font-weight:800; flex:1; cursor:pointer;">CANCEL</button>
            </div>`;
        window.createPopupTemplate(popupHTML);
        
        document.getElementById("confirmLogoutBtn").onclick = () => {
            localStorage.clear();
            window.location.replace("Login.html");
        };
    };

    const logoutBtn = document.getElementById("logoutBtn");
    if(logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            window.handleLogout();
        };
    }

    // 5. --- CUSTOM SUCCESS POPUP ---
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.onsubmit = (e) => {
            e.preventDefault();
            
            const successHTML = `
                <div style="font-size: 3.5rem; margin-bottom: 10px;">✅</div>
                <h2 style="margin-bottom:10px; font-weight:900;">SUCCESS!</h2>
                <p style="opacity:0.8; margin-bottom:20px;">Message sent successfully. We'll contact you soon!</p>
                <button onclick="closePopup()" style="background:#10b981; color:white; border:none; padding:12px 30px; border-radius:15px; font-weight:800; cursor:pointer; width: 100%;">AWESOME</button>
            `;
            
            window.createPopupTemplate(successHTML);
            contactForm.reset();
        };
    }
});