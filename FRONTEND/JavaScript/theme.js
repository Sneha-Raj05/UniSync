
document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        /* Global Transitions */
        body { transition: background 0.3s, color 0.3s; }
        
        /* Dark Mode Colors */
        body.dark-mode { background-color: #0f172a !important; }
        body.dark-mode .navbar, body.dark-mode nav { background: #1e293b !important; border-bottom: 1px solid #334155 !important; }
        
        /* Welcome Text Yellow Fix */
        body.dark-mode #hero-welcome-text, 
        body.dark-mode #hero-welcome-text * { color: #facc15 !important; }

        /* Dark Mode Footer */
        body.dark-mode footer { background: #1e293b !important; color: #cbd5e1 !important; border-top: 1px solid #334155 !important; }

        /* Navbar Right Section Setup */
        .nav-right-actions {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 15px;
        }

        /* Moon Button - No Circle Fix */
        #theme-toggle-btn {
            cursor: pointer;
            border: none;
            background: none !important;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            transition: 0.3s;
            color: #1e293b;
        }
        body.dark-mode #theme-toggle-btn { color: #facc15 !important; }
    `;
    document.head.appendChild(style);

    const navbar = document.querySelector('nav') || document.querySelector('.navbar');
    const authBtn = document.getElementById("auth-button");

    if (navbar && authBtn) {
        const actionContainer = document.createElement('div');
        actionContainer.className = 'nav-right-actions';

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'theme-toggle-btn';
        
        const updateIcon = () => {
            const isDark = document.body.classList.contains('dark-mode');
            toggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        };

        if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
        updateIcon();

        authBtn.parentNode.insertBefore(actionContainer, authBtn);
        actionContainer.appendChild(toggleBtn);
        actionContainer.appendChild(authBtn);

        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
            updateIcon();
        });
    }
});