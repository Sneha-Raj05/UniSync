document.addEventListener("DOMContentLoaded", () => {

    const loginRedirectURL = "Login.html";
    const homeRedirectURL = "Home.html";

    const signupBtn = document.querySelector(".log"); 

    const usernameInput = document.querySelector('input[placeholder="Enter your username"]');
    const emailInput = document.querySelector('input[placeholder="Enter your e-mail"]');
    const passwordInput = document.querySelector('input[placeholder="Enter your password"]');
    const confirmPasswordInput = document.querySelector('input[placeholder="Re-enter your password"]');
    const universityInput = document.querySelector('input[placeholder="Enter your University name"]'); 

    const navItems = document.querySelectorAll(".nav-item");
    const navBtn = document.querySelector(".navbar button");

    if (navItems.length >= 5) {
        navItems[0].addEventListener("click", () => window.location.href = homeRedirectURL);
        navItems[1].addEventListener("click", () => window.location.href = "Notes.html");
        navItems[2].addEventListener("click", () => window.location.href = "Events.html");
        navItems[3].addEventListener("click", () => window.location.href = "Profile.html");
        navItems[4].addEventListener("click", () => window.location.href = "Registered.html");
    }

    if (navBtn) navBtn.addEventListener("click", () => window.location.href = loginRedirectURL);

    if (signupBtn) {
        signupBtn.addEventListener("click", async (e) => { 
            e.preventDefault();
            
            const username = usernameInput ? usernameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';
            const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value.trim() : '';
            const university = universityInput ? universityInput.value.trim() : '';
            
            if (!username || !email || !password || !confirmPassword || !university) {
                showPopup("⚠ Please fill all fields!", "error");
                return;
            }

            if (password !== confirmPassword) {
                showPopup("❌ Passwords do not match!", "error");
                return;
            }
            
            const data = {
                username: username,
                email: email,
                password: password,
              
                university: university
            };

            signupBtn.disabled = true;
            signupBtn.textContent = 'Signing Up...';

            try {
                const response = await fetch('https://unisync-backend-final.vercel.app/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
               
                const clonedResponse = response.clone(); 

                if (response.ok) {
                    const result = await response.json();
                    showPopup("✅ Account created successfully! Redirecting to Login...", "success");
                    
                    setTimeout(() => {
                        window.location.href = loginRedirectURL;
                    }, 1500);

                } else {
                    let errorMessage = `Error ${response.status}: Failed to sign up.`;
                    
                    try {
                      
                        const errorResult = await clonedResponse.json(); 
                        errorMessage = errorResult.message || errorMessage;
                    } catch (e) {
                        const plainTextError = await response.text(); 
                        errorMessage = `Server Error ${response.status}: ${plainTextError.substring(0, 100)}...`;
                    }
                    
                    showPopup("❌ Signup failed: " + errorMessage, "error");
                }

            } catch (error) {
                console.error('Network Error:', error);
                showPopup("❌ Network error. Check server status or URL.", "error");
            } finally {
                signupBtn.disabled = false;
                signupBtn.textContent = 'SignUp'; 
            }
        });
    }

    function showPopup(message, type) {
        const existingPop = document.querySelector('.custom-popup-wrapper');
        if (existingPop) existingPop.remove();

        const popup = document.createElement("div");
        popup.textContent = message;
        popup.style.position = "fixed";
        popup.style.bottom = "30px";
        popup.style.left = "50%";
        popup.style.transform = "translateX(-50%)";
        popup.style.padding = "14px 28px";
        popup.style.borderRadius = "8px";
        popup.style.fontFamily = "Poppins, sans-serif";
        popup.style.color = "#fff";
        popup.style.fontWeight = "600";
        popup.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
        popup.style.background = type === "success"
            ? "linear-gradient(45deg, #007bff, #00bfff)"
            : "linear-gradient(45deg, #ff4d4d, #ff8080)";
        popup.style.zIndex = "9999";
        popup.style.transition = "opacity 0.5s ease";
        popup.style.opacity = "1";

        document.body.appendChild(popup);
        setTimeout(() => {
            popup.style.opacity = "0";
            setTimeout(() => popup.remove(), 500);
        }, 1800);
    }

});


