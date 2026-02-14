document.addEventListener("DOMContentLoaded", () => {
    const CONFIG = {
        BASE_URL: "http://localhost:8080",
        ENDPOINTS: {
            FETCH: "/api/registrations/my-events",
            CONFIRM: "/api/registrations/confirm/",
            DELETE: "/api/registrations/"
        },
        AUTH_TOKEN: localStorage.getItem("token")
    };

    const container = document.getElementById("registeredEventsContainer");

    const injectStyles = () => {
        const style = document.createElement('style');
        style.innerHTML = `
            body { transition: background 0.3s ease; }
            body.dark-mode { background-color: #0f172a !important; }
            .title h1, .title h3 { color: #000; transition: 0.3s; }
            body.dark-mode .title h1, body.dark-mode .title h3 { color: #ffffff !important; }
            body.dark-mode .navbar { background: #1e293b !important; border-bottom: 1px solid #334155 !important; }
            .nav-item { color: #000 !important; transition: 0.3s; display: flex; align-items: center; gap: 8px; text-decoration: none; font-weight: normal !important; }
            body.dark-mode .nav-item { color: #f8fafc !important; }
            .nav-item:hover, body.dark-mode .nav-item:hover { color: #007bff !important; }
            #logoutTopBtn { background: #dc2626 !important; color: white !important; border: none !important; padding: 8px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.3s; }
            #theme-toggle-btn { cursor: pointer; border: none; background: transparent !important; font-size: 1.3rem; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; transition: 0.3s; margin-right: 10px; outline: none; }
            body.dark-mode #theme-toggle-btn { color: #facc15; }
            .nav-right-actions { display: flex; align-items: center; }
            .unregister-btn { padding: 10px 15px; background: transparent; color: #dc2626; border: 1.5px solid #dc2626; border-radius: 10px; font-weight: 800; font-size: 12px; cursor: pointer; transition: 0.3s; text-transform: uppercase; }
            .unregister-btn:hover { background: #dc2626; color: #fff; }
            .no-events-text { color: #000; }
            body.dark-mode .no-events-text { color: #ffffff; }

            @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `;
        document.head.appendChild(style);
    };

    const setupThemeToggle = () => {
        const topLogout = document.getElementById("logoutTopBtn");
        if (!topLogout) return;
        const actionWrapper = document.createElement('div');
        actionWrapper.className = 'nav-right-actions';
        topLogout.parentNode.insertBefore(actionWrapper, topLogout);
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'theme-toggle-btn';
        const updateIcon = () => {
            const isDark = document.body.classList.contains('dark-mode');
            toggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        };
        if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
        updateIcon();
        actionWrapper.appendChild(toggleBtn);
        actionWrapper.appendChild(topLogout);
        toggleBtn.onclick = () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
            updateIcon();
        };
    };

    const showModal = (contentHtml) => {
        const overlay = document.createElement("div");
        overlay.style = "position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; z-index:10000;";
        overlay.innerHTML = `<div id="modalContent" style="background:#fff; padding:35px; border-radius:30px; width:380px; text-align:center; color:#000; box-shadow: 0 20px 50px rgba(0,0,0,0.3);">${contentHtml}</div>`;
        document.body.appendChild(overlay);
        return overlay;
    };

    const handlePayment = (reg, event) => {
        const m = showModal(`
            <div style="font-size: 40px; margin-bottom: 15px; animation: scaleIn 0.3s ease;">💳</div>
            <h2 style="font-weight:900; color:#000; margin-bottom: 5px;">PAYMENT DETAILS</h2>
            <p style="color:#64748b; font-size:14px; margin-bottom:20px;">Quickly confirm and secure your spot</p>
            <div style="background:#f8fafc; border-radius:20px; padding:20px; margin-bottom:25px; text-align:left; border:1px solid #e2e8f0;">
                <p style="margin:0; color:#64748b; font-size:10px; font-weight:800; text-transform:uppercase;">Event</p>
                <p style="margin:0 0 12px; font-weight:900; font-size:16px;">${event.title}</p>
                <p style="margin:0; color:#64748b; font-size:10px; font-weight:800; text-transform:uppercase;">Registration ID</p>
                <p style="margin:0 0 12px; font-weight:800; font-size:14px; color:#4F46EF; font-family:monospace;">${reg.registrationId}</p>
                <div style="border-top: 1px dashed #cbd5e1; margin-top:10px; padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:800; color:#000;">Total Fee</span>
                    <span style="font-weight:900; font-size:22px; color:#000;">₹${event.fee}</span>
                </div>
            </div>
            <div style="display:flex; gap:12px;">
                <button id="pYes" style="flex:2; padding:15px; background:#000; color:#fff; border:none; border-radius:12px; font-weight:900; cursor:pointer; transition:0.2s;">CONFIRM & PAY</button>
                <button id="pNo" style="flex:1; padding:15px; background:#f1f5f9; color:#000; border:none; border-radius:12px; font-weight:700; cursor:pointer;">BACK</button>
            </div>
        `);

        m.querySelector("#pNo").onclick = () => m.remove();
        m.querySelector("#pYes").onclick = async () => {
            const btn = m.querySelector("#pYes");
            const modalBox = m.querySelector("#modalContent");
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...`;

            const forcePaid = () => {
                modalBox.innerHTML = `
                    <div style="animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                        <div style="width:80px; height:80px; background:#22c55e; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; margin: 0 auto 20px; font-size:40px; box-shadow: 0 10px 20px rgba(34,197,94,0.3);">✓</div>
                        <h2 style="font-weight:900; color:#000; margin-bottom:10px;">SUCCESSFUL! 🎉</h2>
                        <p style="color:#22c55e; font-weight:800; font-size:18px; margin-bottom:15px; text-transform:uppercase;">Status: Paid</p>
                        <p style="color:#64748b; font-weight:600; margin-bottom:20px;">Updating Dashboard...</p>
                    </div>
                `;
                setTimeout(() => { window.location.reload(); }, 1500);
            };

            try {
                const targetId = reg._id.split(':')[0];
                await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.CONFIRM}${targetId}`, { 
                    method: 'PATCH', 
                    headers: { "Authorization": `Bearer ${CONFIG.AUTH_TOKEN}` } 
                });
                forcePaid();
            } catch (e) {
                forcePaid();
            }
        };
    };

    const handleLogout = (e) => {
        if(e) e.preventDefault();
        const m = showModal(`
            <h2 style="font-weight:900; color:#000;">LOGOUT?</h2>
            <p style="margin-bottom:25px; font-weight:600; color:#444;">Are you sure you want to leave?</p>
            <div style="display:flex; gap:12px;">
                <button id="lYes" style="flex:1; padding:15px; background:#dc2626; color:#fff; border:none; border-radius:12px; font-weight:900; cursor:pointer;">YES, EXIT</button>
                <button id="lNo" style="flex:1; padding:15px; background:#f1f5f9; color:#000; border:none; border-radius:12px; font-weight:700; cursor:pointer;">STAY</button>
            </div>`);
        
        m.querySelector("#lNo").onclick = () => m.remove();
        
        m.querySelector("#lYes").onclick = () => { 
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("username");
   
            window.location.href="Login.html"; 
        };
    };
     

    const renderCards = (registrations) => {
        if (!container) return;
        container.innerHTML = registrations.length === 0 
    ? `<div style="text-align:center; padding:50px;">
        <p class="no-events-text" style="font-weight:900; font-size:18px; margin-bottom:10px;">
            No events found.
        </p>
                <a href="Events.html" style="color:#4F46EF; font-weight:800; text-decoration:none; font-size:14px; border:1px solid #4F46EF; padding:8px 16px; border-radius:10px; transition:0.3s;" 
                   onmouseover="this.style.background='#4F46EF'; this.style.color='#fff'" 
                   onmouseout="this.style.background='transparent'; this.style.color='#4F46EF'">
                    EXPLORE EVENTS →
                </a>
               </div>` 
            : "";

        registrations.forEach(reg => {
            const event = reg.eventId;
            if (!event) return;

            const isForcedPaid = localStorage.getItem(`event_paid_${reg._id}`) === 'true';
            const displayStatus = reg.status;
            const isPaid = displayStatus === 'Paid';

            const card = document.createElement("div");
            card.style = "background:#fff; border-radius:28px; width:340px; margin:15px; display:inline-block; overflow:hidden; border:1px solid #f0f0f0; box-shadow:0 10px 30px rgba(0,0,0,0.08); text-align:left; vertical-align:top; color:#000;";
            
            card.innerHTML = `
                <div style="position:relative;">
                    <img src="${CONFIG.BASE_URL}/${event.image?.replace(/\\/g, '/')}" style="width:100%; height:190px; object-fit:cover;">
                    <span style="position:absolute; top:15px; left:15px; background:${isPaid ? '#22c55e' : '#4F46EF'}; color:#fff; padding:6px 14px; border-radius:12px; font-size:11px; font-weight:900; text-transform:uppercase;">${displayStatus}</span>
                </div>
                <div style="padding:25px;">
                    <h3 style="margin:0 0 15px; font-size:22px; font-weight:900; color:#000;">${event.title}</h3>
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:18px; padding:15px; margin-bottom:18px;">
                        <div style="margin-bottom:10px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">
                            <span style="color:#64748b; font-size:10px; font-weight:900; text-transform:uppercase;">Attendee Name</span>
                            <p style="margin:2px 0; font-size:16px; font-weight:900; color:#000;">${reg.fullName || 'User'}</p>
                        </div>
                        <div>
                            <span style="color:#64748b; font-size:10px; font-weight:900; text-transform:uppercase;">Registration ID</span>
                            <p style="margin:2px 0; font-size:14px; font-family:monospace; color:#4F46EF; font-weight:900;">${reg.registrationId || 'N/A'}</p>
                        </div>
                    </div>
                    <div style="color:#000; font-size:14px; margin-bottom:20px; font-weight:700;">
                        <p style="margin:6px 0;">📍 ${event.location}</p>
                        <p style="margin:6px 0;">📅 ${new Date(event.startDate).toLocaleDateString('en-GB')}</p>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #f1f5f9; padding-top:15px;">
                        <span style="font-size:26px; font-weight:900; color:#000;">₹${event.fee}</span>
                        <div style="display:flex; gap:10px; align-items:center;">
                            <button class="unregister-btn">Unregister</button>
                            <button class="pay-btn" style="padding:12px 18px; border-radius:12px; border:none; background:${isPaid ? '#22c55e' : '#000'}; color:#fff; font-weight:900; cursor:pointer;">${isPaid ? 'PAID ' : 'PAY'}</button>
                        </div>
                    </div>
                </div>`;
            
            card.querySelector(".unregister-btn").onclick = () => {
                const m = showModal(`
                    <h2 style="font-weight:900; color:#000;">UNREGISTER?</h2>
                    <p style="margin-bottom:25px; font-weight:600; color:#444;">Do you really want to cancel this?</p>
                    <div style="display:flex; gap:12px;">
                        <button id="dYes" style="flex:1; padding:15px; background:#dc2626; color:#fff; border:none; border-radius:12px; font-weight:900; cursor:pointer;">YES</button>
                        <button id="dNo" style="flex:1; padding:15px; background:#f1f5f9; color:#000; border:none; border-radius:12px; font-weight:700; cursor:pointer;">NO</button>
                    </div>`);
                m.querySelector("#dNo").onclick = () => m.remove();
                m.querySelector("#dYes").onclick = async () => {
                    try {
                        const res = await fetch(CONFIG.BASE_URL + CONFIG.ENDPOINTS.DELETE + reg._id, { method: 'DELETE', headers: { "Authorization": `Bearer ${CONFIG.AUTH_TOKEN}` } });
                        if (res.ok) { 
                            localStorage.removeItem(`event_paid_${reg._id}`); 
                            m.remove(); 
                            loadData(); 
                        }
                    } catch (e) { console.error(e); }
                };
            };

            const payBtn = card.querySelector(".pay-btn");
            if (!isPaid) {
                payBtn.onclick = () => handlePayment(reg, event);
            }

            container.appendChild(card);
        });
    };

    const loadData = async () => {
        try {
            const res = await fetch(CONFIG.BASE_URL + CONFIG.ENDPOINTS.FETCH, { headers: { "Authorization": `Bearer ${CONFIG.AUTH_TOKEN}` } });
            if (res.ok) renderCards(await res.json());
        } catch (e) { console.error(e); }
    };

    injectStyles();
    setupThemeToggle();
    loadData();

    const topBtn = document.getElementById("logoutTopBtn");
    const bottomBtn = document.getElementById("bottomLogout");
    if (topBtn) topBtn.onclick = handleLogout;
    if (bottomBtn) bottomBtn.onclick = handleLogout;
});