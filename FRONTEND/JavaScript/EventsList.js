//Yeh file API call karegi jisse user event ke liye register ho sake.

// --- JavaScript/EventsList.js ---
const baseURL = 'http://localhost:8080/api/events';
const registrationURL = 'http://localhost:8080/api/registrations'; // Naya URL
const eventsListContainer = document.getElementById('eventsListContainer');
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('userRole');

// Assuming customPopup is defined or imported here

function customPopup(message, color) { /* ... Your popup implementation ... */ } 

async function handleRegistration(eventId, eventTitle) {
    if (!token) {
        customPopup("Please log in to register.", 'orange');
        return;
    }
    
    customPopup(`Registering for ${eventTitle}...`, 'blue');

    try {
        // Registration API Call
        const res = await fetch(`${registrationURL}/${eventId}`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await res.json();

        if (res.ok) {
            customPopup(`✅ Successfully registered for ${eventTitle}!`, 'green');
            // User ko registered events page par bhej sakte hain ya card update kar sakte hain.
        } else {
            customPopup(`❌ Registration failed: ${result.message || 'Error occurred.'}`, 'red');
        }

    } catch (error) {
        customPopup('⚠️ Network error during registration.', 'red');
        console.error('Registration error:', error);
    }
}


async function getEventsList() {
    eventsListContainer.innerHTML = "<p style='text-align:center;'>Loading events...</p>";
    if (userRole === 'organizer') {
        setTimeout(() => window.location.href = 'Events.html', 100); 
        return;
    }

    try {
        const res = await fetch(baseURL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Failed to fetch events.");
        
        const events = await res.json();
        
        eventsListContainer.innerHTML = "";
        if (events.length === 0) {
            eventsListContainer.innerHTML = "<p style='text-align:center;'>No events available yet. Check back soon!</p>";
            return;
        }
        
        events.forEach(renderUserEventCard);
        
    } catch (error) {
         eventsListContainer.innerHTML = "<p style='text-align:center; color: red;'>Error loading events. Please check server connection.</p>";
         console.error("Error fetching events:", error);
    }
}

function renderUserEventCard(event) {
    const card = document.createElement("div");
    card.classList.add("card");
    const eventDate = new Date(event.startDate).toLocaleDateString();

    card.innerHTML = `
      <img src="assets/default.png" class="card-img"> 
      <div class="card-body">
        <h3 class="card-title">${event.title}</h3>
        <p><b>Date:</b> ${eventDate}</p>
        <p><b>Venue:</b> ${event.location}</p>
        <p><b>Description:</b> ${event.description}</p>
        <p><b>Priority:</b> ${event.priority || 'Medium'}</p>
        <p><b>Status:</b> <i class="fa-solid fa-check" style="color: #159349;"></i> Registration Open</p><br/>
        <button class="btn register-btn" data-id="${event._id}">Register Now</button>
      </div>
    `;

    // Register Button Listener
    card.querySelector(".register-btn").addEventListener("click", (e) => {
        const eventId = e.target.dataset.id;
        handleRegistration(eventId, event.title);
    });

    eventsListContainer.appendChild(card);
}

document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    getEventsList(); 
});