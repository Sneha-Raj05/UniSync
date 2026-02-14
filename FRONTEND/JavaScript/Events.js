document.addEventListener("DOMContentLoaded", () => {
    const baseURL = 'https://uni-sync-sam7.vercel.app/api/events';
    const registrationURL = 'https://uni-sync-sam7.vercel.app/api/registrations'; 
    const token = localStorage.getItem('token');
    
    const userEmail = localStorage.getItem('userEmail') || ''; 
    const userName = localStorage.getItem('userName') || '';   

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const injectStyles = () => {
        const style = document.createElement('style');
        style.innerHTML = `
            body { transition: background 0.3s ease; }
            
            .nav-item { 
                transition: color 0.3s ease !important; 
                text-decoration: none;
            }
            .nav-item:hover { color: #007bff !important; }

            /* PREMIUM LOGOUT BUTTON STYLE */
            .logout-premium {
                background-color: #e32626 !important;
                color: white !important;
                border-radius: 12px !important;
                padding: 10px 25px !important;
                border: none !important;
                font-weight: 700 !important;
                font-size: 0.95rem !important;
                cursor: pointer !important;
                box-shadow: 0 4px 12px rgba(227, 38, 38, 0.25) !important;
                transition: all 0.3s ease !important;
            }
            .logout-premium:hover { transform: translateY(-2px); background-color: #ff3333 !important; }

            /* THEME TOGGLE BUTTON */
            #theme-toggle-btn { 
                cursor: pointer !important; border: none !important; background: none !important; 
                font-size: 1.4rem !important; color: #475569 !important; padding: 0; margin-right: 15px;
            }
            body.dark-mode #theme-toggle-btn { color: #facc15 !important; }

            /* DARK MODE RULES */
            body.dark-mode { background-color: #0f172a !important; }
            body.dark-mode .navbar { background: #1e293b !important; border-bottom: 1px solid #334155 !important; }
            body.dark-mode .nav-item { color: #f8fafc !important; }
            body.dark-mode .nav-item:hover { color: #007bff !important; }
            body.dark-mode .h1, body.dark-mode .h3, body.dark-mode h1, body.dark-mode h3 { color: #ffffff !important; }
            body.dark-mode .card-title {
               color: #000000 !important;}
            
            body.dark-mode .main-login { 
                background: #1e293b; color: white; border: 1px solid #334155; 
            }
            body.dark-mode input, body.dark-mode textarea { 
                background: #0f172a; border: 1px solid #334155; color: white; 
            }

            /* LOGOUT CONFIRMATION MODAL */
            .logout-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.7) !important; display: flex; align-items: center;
                justify-content: center; z-index: 100000; backdrop-filter: blur(4px);
            }
            .logout-box {
                background: white !important; padding: 35px; border-radius: 25px !important;
                width: 350px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4) !important;
            }
        `;
        document.head.appendChild(style);
    };

    const setupNavbar = () => {
        const allButtons = document.querySelectorAll('button');
        let loginBtn = null;
        allButtons.forEach(btn => {
            if(btn.textContent.toLowerCase().includes('login')) loginBtn = btn;
        });

        if (loginBtn) {
            loginBtn.textContent = 'Logout';
            loginBtn.classList.add('logout-premium');
            
            if (!document.getElementById('theme-toggle-btn')) {
                const tgl = document.createElement('button');
                tgl.id = 'theme-toggle-btn';
                const updateIcon = () => { tgl.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙'; };
                updateIcon();
                
                loginBtn.parentNode.style.display = 'flex';
                loginBtn.parentNode.style.alignItems = 'center';
                loginBtn.parentNode.insertBefore(tgl, loginBtn);
                
                tgl.onclick = () => {
                    document.body.classList.toggle('dark-mode');
                    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
                    updateIcon();
                };
            }

            loginBtn.onclick = (e) => {
                e.preventDefault();
                const overlay = document.createElement("div");
                overlay.className = "logout-overlay";
                overlay.innerHTML = `
                    <div class="logout-box">
                        <h2 style="color:black; margin-bottom:10px; font-family:sans-serif;">LOGOUT?</h2>
                        <p style="color:#64748b; margin-bottom:25px; font-family:sans-serif;">Are you sure you want to leave?</p>
                        <div style="display:flex; gap:12px;">
                            <button id="confirmExit" style="flex:1; padding:14px; background:#e32626; color:white; border-radius:12px; border:none; font-weight:700; cursor:pointer;">YES, EXIT</button>
                            <button id="cancelExit" style="flex:1; padding:14px; background:#f1f5f9; color:#1e293b; border-radius:12px; border:none; font-weight:700; cursor:pointer;">STAY</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(overlay);
                document.getElementById("confirmExit").onclick = () => { 
                    localStorage.clear(); 
                    window.location.href = "login.html"; 
                };
                document.getElementById("cancelExit").onclick = () => overlay.remove();
            };
        }
    };

    injectStyles();
    setupNavbar();
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') document.body.classList.add('dark-mode');

    const userRole = localStorage.getItem('userRole') ? localStorage.getItem('userRole').toLowerCase().trim() : null;
    let currentEditingEventId = null;
    let userRegistrations = []; 

    const eventContainer = document.querySelector('.card-container');
    const formSection = document.querySelector('.main-login');
    const form = document.querySelector('.main-login form');
    const titleInput = document.querySelector('input[placeholder="Enter the title"]');
    const dateInput = document.querySelector('input[type="date"]');
    const venueInput = document.querySelector('input[placeholder="Enter the Venue"]');
    const descInput = document.querySelector('.main-login textarea');
    const submitBtn = document.querySelector('button[type="submit"]') || document.querySelectorAll('.log')[1];

    if (userRole !== 'organizer') {
        const hideList = ['.main-login', '.h1', '.h3', 'hr'];
        hideList.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) el.style.display = 'none';
        });
    }

    const showPopup = (message, type = 'success') => {
        const bg = type === 'success' ? 'linear-gradient(45deg, #28a745, #1e7e34)' : 'linear-gradient(45deg, #dc3545, #c82333)';
        const popup = document.createElement('div');
        popup.style.cssText = `position: fixed; top: 20px; left: 50%; transform: translateX(-50%); padding: 15px 30px; border-radius: 8px; color: white; font-weight: bold; background: ${bg}; z-index: 10005; box-shadow: 0 4px 15px rgba(0,0,0,0.3); font-family: sans-serif; transition: all 0.5s ease;`;
        popup.textContent = message;
        document.body.appendChild(popup);
        setTimeout(() => { popup.style.opacity = '0'; setTimeout(() => popup.remove(), 500); }, 3000);
    };

    const showConfirm = (message, onConfirm) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10006;`;
        overlay.innerHTML = `
            <div style="background: white; padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.2); max-width: 350px;">
                <p style="margin-bottom: 20px; font-size: 18px; font-weight: bold; color: #333;">${message}</p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="yesBtn" style="background: #dc3545; color: white; border: none; padding: 10px 25px; border-radius: 6px; cursor: pointer; font-weight: bold;">Delete</button>
                    <button id="noBtn" style="background: #6c757d; color: white; border: none; padding: 10px 25px; border-radius: 6px; cursor: pointer; font-weight: bold;">Cancel</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('#yesBtn').onclick = () => { onConfirm(); overlay.remove(); };
        overlay.querySelector('#noBtn').onclick = () => overlay.remove();
    };

    const fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    const browseBtn = document.querySelector('.main-login .log:not([type="submit"])');
    if (browseBtn) browseBtn.onclick = (e) => { e.preventDefault(); fileInput.click(); };

    async function handleSubmitEvent(e) {
        if (e) e.preventDefault();
        const formData = new FormData();
        const feeField = document.querySelector('input[placeholder*="Fee"]');
        formData.append('title', titleInput.value.trim());
        formData.append('startDate', dateInput.value.trim());
        formData.append('location', venueInput.value.trim());
        formData.append('description', descInput.value.trim());
        formData.append('fee', feeField ? feeField.value.trim() : "0"); 
        formData.append('priority', 'Medium');
        if (fileInput.files[0]) formData.append('image', fileInput.files[0]);
        submitBtn.disabled = true;
        try {
            const url = currentEditingEventId ? `${baseURL}/${currentEditingEventId}` : baseURL;
            const method = currentEditingEventId ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: formData });
            if (res.ok) {
                showPopup(currentEditingEventId ? "✅ Event Updated!" : "✅ Event Created!");
                setTimeout(() => location.reload(), 1000);
            } else { showPopup("❌ Error saving event", "error"); }
        } catch (err) { showPopup("⚠️ Network error", "error"); }
        finally { submitBtn.disabled = false; }
    }

    function showRegistrationForm(eventId, eventTitle) {
        const isAlreadyRegistered = userRegistrations.some(reg => reg.eventId && reg.eventId._id === eventId);
        if (isAlreadyRegistered) return showPopup("❌ Already registered!", "error");

        const overlay = document.createElement("div");
        overlay.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:10007; backdrop-filter: blur(5px);`;
        
        overlay.innerHTML = `
            <div style="background:white; padding:30px; border-radius:15px; width:90%; max-width:400px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                <h2 style="color:#4F46EF; margin-bottom:10px; font-family:sans-serif;">Register for ${eventTitle}</h2>
                <form id="userRegForm">
                    <p style="margin:0; font-size:12px; color:#888;">Full Name</p>
                    <input type="text" id="regName" value="${userName}" placeholder="Full Name" required style="width:100%; padding:12px; margin:5px 0 15px; border:1px solid #ddd; border-radius:8px;">
                    <p style="margin:0; font-size:12px; color:#888;">Registration Email (Locked)</p>
                    <input type="email" id="regEmail" value="${userEmail}" readonly required style="width:100%; padding:12px; margin:5px 0 15px; border:1px solid #ddd; border-radius:8px; background:#f5f5f5; cursor:not-allowed; color:#555;">
                    <p style="margin:0; font-size:12px; color:#888;">Enter Registration ID</p>
                    <input type="text" id="regId" placeholder="e.g. REG12345" required style="width:100%; padding:12px; margin:5px 0 15px; border:1px solid #ddd; border-radius:8px;">
                    <button type="submit" id="confirmRegBtn" style="width:100%; background:#4F46EF; color:white; border:none; padding:14px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px;">Confirm Registration</button>
                    <button type="button" id="closeReg" style="width:100%; background:none; border:none; color:#888; margin-top:10px; cursor:pointer;">Cancel</button>
                </form>
            </div>`;
        document.body.appendChild(overlay);

        overlay.querySelector('#closeReg').onclick = () => overlay.remove();
        overlay.querySelector('#userRegForm').onsubmit = async (e) => {
            e.preventDefault();
            const payload = { 
                fullName: document.getElementById('regName').value.trim(), 
                email: document.getElementById('regEmail').value.trim(),
                registrationId: document.getElementById('regId').value.trim()
            };
            try {
                const res = await fetch(`${registrationURL}/${eventId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    showPopup("✨ Registration Successful!");
                    setTimeout(() => window.location.href = "Registered.html", 1000);
                } else {
                    const d = await res.json();
                    showPopup(d.message || "Registration failed", "error");
                }
            } catch (err) { showPopup("⚠️ Connection Error", "error"); }
        };
    }

    function renderEventCard(event) {
        const card = document.createElement("div");
        card.classList.add("card");
        const isAlreadyRegistered = userRegistrations.some(reg => reg.eventId && reg.eventId._id === event._id);
        const imageSource = event.image ? `https://uni-sync-sam7.vercel.app/${event.image.replace(/\\/g, '/')}` : 'assets/default.png';
        
        card.innerHTML = `
            <img src="${imageSource}" class="card-img">
            <div class="card-body">
                <h3 class="card-title">${event.title}</h3>
                <p><b>Date:</b> ${new Date(event.startDate).toLocaleDateString()}</p>
                <p><b>Venue:</b> ${event.location}</p>
                <p><b>Fee:</b> ₹${event.fee || '0'}</p> 
                <p><b>Description:</b> ${event.description}</p>
                <br/>
                <div class="btn-group" style="display: flex; gap: 10px;">
                    ${userRole === 'organizer' ? `
                        <button class="btn edit-btn" style="background:#007bff; color:white; padding:10px; border-radius:5px; border:none; cursor:pointer; flex:1;">Edit</button>
                        <button class="btn delete-btn" style="background:#dc3545; color:white; padding:10px; border-radius:5px; border:none; cursor:pointer; flex:1;">Delete</button>
                    ` : `
                        <button class="btn register-btn" style="background:${isAlreadyRegistered ? '#28a745' : '#4F46EF'}; color:white; width:100%; padding:12px; border-radius:5px; border:none; cursor:${isAlreadyRegistered ? 'default' : 'pointer'}; font-weight:bold;" ${isAlreadyRegistered ? 'disabled' : ''}>
                            ${isAlreadyRegistered ? 'Already Registered ✓' : 'Register Now'}
                        </button>
                    `}
                </div>
            </div>`;

        if (userRole === 'organizer') {
            card.querySelector(".edit-btn").onclick = () => {
                titleInput.value = event.title;
                dateInput.value = new Date(event.startDate).toISOString().split('T')[0];
                venueInput.value = event.location;
                descInput.value = event.description;
                const f = document.querySelector('input[placeholder*="Fee"]'); if(f) f.value = event.fee;
                currentEditingEventId = event._id;
                submitBtn.textContent = 'Update Event';
                formSection.scrollIntoView({ behavior: 'smooth' });
            };
            card.querySelector(".delete-btn").onclick = () => {
                showConfirm(`Delete "${event.title}"?`, async () => {
                    await fetch(`${baseURL}/${event._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                    getEvents();
                });
            };
        } else if (!isAlreadyRegistered) {
            card.querySelector(".register-btn").onclick = () => showRegistrationForm(event._id, event.title);
        }
        eventContainer.appendChild(card);
    }

    async function getEvents() {
        try {
            const regRes = await fetch(`${registrationURL}/my-events`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (regRes.ok) userRegistrations = await regRes.json();
            const res = await fetch(baseURL, { headers: { 'Authorization': `Bearer ${token}` } });
            const events = await res.json();
            if (eventContainer && Array.isArray(events)) { 
                eventContainer.innerHTML = ""; 
                events.forEach(renderEventCard); 
            }
        } catch (err) { console.error(err); }
    }

    if (form) form.addEventListener('submit', handleSubmitEvent);
    getEvents();

});

