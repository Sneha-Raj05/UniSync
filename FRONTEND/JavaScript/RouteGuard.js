function showPopup(message, type = "info") {
    const popup = document.createElement('div');
    popup.textContent = message;
    popup.style.position = 'fixed';
    popup.style.top = '20px';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.padding = '12px 22px';
    popup.style.borderRadius = '8px';
    popup.style.color = '#fff';
    popup.style.fontFamily = 'Poppins, sans-serif';
    popup.style.fontWeight = '600';
    popup.style.zIndex = '10000';
    popup.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
    popup.style.transition = 'opacity 0.3s ease-out';
    
    if (type === 'success') popup.style.background = 'linear-gradient(45deg,#007bff,#00bfff)';
    else if (type === 'error') popup.style.background = 'linear-gradient(45deg,#ff416c,#ff4b2b)';
    else if (type === 'warning') popup.style.background = 'linear-gradient(45deg,#ffc107,#ffa000)';
    else popup.style.background = 'linear-gradient(45deg,#333,#666)';
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 400);
    }, 1800);
}

function showConfirm(message, callback) {
    const confirmBox = document.createElement('div');
    confirmBox.style.position = 'fixed';
    confirmBox.style.top = '0';
    confirmBox.style.left = '0';
    confirmBox.style.width = '100%';
    confirmBox.style.height = '100%';
    confirmBox.style.background = 'rgba(0,0,0,0.4)';
    confirmBox.style.display = 'flex';
    confirmBox.style.alignItems = 'center';
    confirmBox.style.justifyContent = 'center';
    confirmBox.style.zIndex = '10001';

    confirmBox.innerHTML = `
        <div style="
            background:white; padding:25px; border-radius:12px;
            box-shadow:0 0 15px rgba(0,0,0,.5); text-align:center; width: 280px;">
            <p style="font-size:18px; color:#333;">${message}</p>
            <div style="margin-top:15px; display:flex; justify-content:space-around;">
                <button id="confirmYes" style="padding:10px 20px; background:#dc3545; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:600;">Yes</button>
                <button id="confirmNo" style="padding:10px 20px; background:#6c757d; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:600;">No</button>
            </div>
        </div>
    `;

    document.body.appendChild(confirmBox);

    document.getElementById('confirmYes').onclick = () => {
        confirmBox.remove();
        callback();
    };
    document.getElementById('confirmNo').onclick = () => {
        confirmBox.remove();
    };
}

window.handleLogout = function() {
    showConfirm('Are you sure you want to log out?', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('profileData'); 
        showPopup('👋 Logging out...', 'warning');
        setTimeout(() => {
            window.location.href = 'Login.html';
        }, 1200);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        showPopup('🔒 Access Denied. Please log in.', 'error'); 
        setTimeout(() => {
            window.location.href = 'Login.html';
        }, 1200);
        return;
    }

    const logoutBtn = document.getElementById('logoutTopBtn') || document.querySelector('.navbar button');
    if (logoutBtn) {
        logoutBtn.textContent = 'Logout';
        logoutBtn.addEventListener('click', window.handleLogout);
        
        logoutBtn.style.backgroundColor = '#990d0d';
        logoutBtn.style.color = 'white';
        logoutBtn.style.border = 'none';
    }
});
