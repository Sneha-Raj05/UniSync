console.log("HOME JS FILE LOADED");

document.addEventListener("DOMContentLoaded", () => {
    const authButton = document.getElementById("auth-button");
    const heroButton = document.getElementById("hero-main-button");
    const heroText = document.getElementById("hero-welcome-text");
    const heroSection = document.querySelector(".hero");
    const token = localStorage.getItem("token");
    const username = localStorage.getItem('username');


    if (!authButton || !heroButton) {
        console.error("Buttons not found in HTML");
        return;
    }

    const homeLink = document.getElementById('home-nav');
    const notesLink = document.getElementById('notes-nav');
    const eventsLink = document.getElementById('events-nav');
    const profileLink = document.getElementById('profile-nav');
    const registeredLink = document.getElementById('registered-nav'); 

    const username = localStorage.getItem('username');
    
if (!token) {
    authButton.textContent = "Login";
    authButton.onclick = () => window.location.href = "Login.html";

    heroButton.textContent = "Get Started!";
    heroButton.style.display = "inline-block";
    heroButton.onclick = () => window.location.href = "Signup.html";

    return;
}

    const showLogoutModal = () => {
        const overlay = document.createElement("div");
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); display: flex; align-items: center;
            justify-content: center; z-index: 100000; backdrop-filter: blur(5px);
        `;

        overlay.innerHTML = `
            <div style="background: white; padding: 35px; border-radius: 20px; width: 350px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.3); font-family: sans-serif;">
                <h2 style="color: black; margin: 0 0 10px 0; font-size: 24px; font-weight: 800;">LOGOUT?</h2>
                <p style="color: #64748b; margin-bottom: 25px; font-size: 16px;">Are you sure you want to leave?</p>
                <div style="display: flex; gap: 12px;">
                    <button id="confirmExit" style="flex: 1; padding: 14px; background: #e32626; color: white; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; transition: 0.3s;">YES, EXIT</button>
                    <button id="cancelExit" style="flex: 1; padding: 14px; background: #f1f5f9; color: #1e293b; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; transition: 0.3s;">STAY</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById("confirmExit").onclick = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = 'index.html';
        };
        document.getElementById("cancelExit").onclick = () => overlay.remove();
    };


  
        authButton.textContent = "Logout";

        authButton.style.cssText = `
            background-color: #E74C3C !important;
            color: white !important;
            border: none !important;
            padding: 8px 20px !important;
            border-radius: 8px !important;
            font-weight: bold !important;
            cursor: pointer !important;
            transition: transform 0.2s;
        `;
        
        heroText.innerHTML = `Welcome back, ${username || 'User'}! <br> Let's get to work.`;
        heroButton.style.display = 'none'; 
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.marginTop = '30px';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.gap = '20px';
        buttonContainer.id = 'dynamic-cta-buttons';
        
        buttonContainer.innerHTML = `
            <a href="Notes.html" style="text-decoration: none;">
                <button style="background: #4F46EF; color: white; padding: 12px 25px; border: none; border-radius: 8px; font-size: 1.1em; cursor: pointer; transition: 0.3s; font-weight: bold;">
                    <i class="fa-solid fa-note-sticky"></i> Go to Notes 
                </button>
            </a>
            <a href="Events.html" style="text-decoration: none;">
                <button style="background: #27AE60; color: white; padding: 12px 25px; border: none; border-radius: 8px; font-size: 1.1em; cursor: pointer; transition: 0.3s; font-weight: bold;">
                    <i class="fa-solid fa-address-card"></i> Go to Events
                </button>
            </a>
            <a href="Registered.html" style="text-decoration: none;">
                <button style="background: #FF9800; color: white; padding: 12px 25px; border: none; border-radius: 8px; font-size: 1.1em; cursor: pointer; transition: 0.3s; font-weight: bold;">
                    <i class="fa-solid fa-calendar-check"></i> Registered Events
                </button>
            </a>
        `;
        
        if (!heroSection.querySelector('#dynamic-cta-buttons')) {
    heroSection.appendChild(buttonContainer);
      }

authButton.onclick = (e) => {
    e.preventDefault();
    showLogoutModal();
};

    

    if (homeLink) homeLink.addEventListener("click", () => window.location.href = "index.html");
    if (notesLink) notesLink.addEventListener("click", () => window.location.href = "Notes.html");
    if (eventsLink) eventsLink.addEventListener("click", () => window.location.href = "Events.html");
    if (profileLink) profileLink.addEventListener("click", () => window.location.href = "Profile.html");
    if (registeredLink) registeredLink.addEventListener("click", () => window.location.href = "Registered.html");


    const style = document.createElement('style');
    style.innerHTML = `
        body { transition: background 0.3s, color 0.3s; }
        body.dark-mode { background-color: #0f172a !important; color: #f8fafc !important; }
        body.dark-mode .navbar, body.dark-mode nav { background: #1e293b !important; border-bottom: 1px solid #334155 !important; }
        
        footer { 
            background: #f8f9fa; color: #666; padding: 20px; 
            text-align: center; border-top: 1px solid #eee; transition: 0.3s;
        }
        body.dark-mode footer { 
            background: #1e293b !important; color: #cbd5e1 !important; 
            border-top: 1px solid #334155 !important;
        }

        #theme-toggle-btn {
            cursor: pointer; border: none !important; background: none !important; 
            color: #1e293b; font-size: 1.3rem; outline: none; display: flex; padding: 0;
        }
        body.dark-mode #theme-toggle-btn { color: #facc15 !important; }
        
        /* Logout button hover animation */
        #auth-button:hover { transform: scale(1.05); opacity: 0.9; }
    `;
    document.head.appendChild(style);

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    const navbar = document.querySelector('nav') || document.querySelector('.navbar');
    const authBtn = document.getElementById("auth-button");

    if (navbar && authBtn) {
        const actionContainer = document.createElement('div');
        actionContainer.style.display = 'flex';
        actionContainer.style.flexDirection = 'row'; 
        actionContainer.style.alignItems = 'center';
        actionContainer.style.gap = '15px'; 
        actionContainer.id = 'nav-right-actions';

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'theme-toggle-btn';
        
        const updateIcon = () => {
            const isDark = document.body.classList.contains('dark-mode');
            toggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        };

        updateIcon();

        authBtn.parentNode.insertBefore(actionContainer, authBtn);
        actionContainer.appendChild(toggleBtn);
        actionContainer.appendChild(authBtn);

        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkNow = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDarkNow ? 'dark' : 'light');
            updateIcon();
        });
    }

});







