document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    
    if (localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                showPopup("⚠ Please fill all fields!", "error");
                return;
            }

            try {
                const response = await fetch('https://unisync-backend-final.vercel.app/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (response.ok) {
                  
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('userRole', result.user.role);
                    localStorage.setItem('userEmail', result.user.email); 
                    
            
                    const fullUserName = result.user.name || result.user.username || "User";
                    
                    localStorage.setItem('userName', fullUserName);
                    localStorage.setItem('username', result.user.username);

                    showPopup(` Welcome back, ${fullUserName}!`, "success");

                    setTimeout(() => {
                        if (result.user.role === 'organizer') {
                            window.location.href = 'Events.html';
                        } else {
                            window.location.href = 'index.html';
                        }
                    }, 1500);

                } else {
                    emailInput.value = "";   
                    passwordInput.value = ""; 
                    emailInput.focus();       
                    showPopup(` ${result.message || 'Login failed!'}`, "error");
                }
            } catch (error) {
                console.error("Login Error:", error);
                showPopup(" Server error. Please try again later.", "error");
            }
        });
    }

    function showPopup(message, type) {
        const popup = document.createElement("div");
        popup.textContent = message;
        popup.style.position = "fixed";
        popup.style.bottom = "30px";
        popup.style.left = "50%";
        popup.style.transform = "translateX(-50%)";
        popup.style.padding = "14px 28px";
        popup.style.borderRadius = "8px";
        popup.style.fontFamily = "'Poppins', sans-serif";
        popup.style.color = "#fff";
        popup.style.fontWeight = "600";
        popup.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
        popup.style.zIndex = "9999";
        popup.style.transition = "all 0.4s ease";
        
        popup.style.background = type === "success"
            ? "linear-gradient(45deg, #28a745, #5dd47b)" 
            : "linear-gradient(45deg, #ff4d4d, #ff8080)"; 
        
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.opacity = "0";
            popup.style.bottom = "20px";
            setTimeout(() => popup.remove(), 500);
        }, 2000);
    }

});



