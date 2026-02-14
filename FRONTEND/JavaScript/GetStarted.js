document.addEventListener("DOMContentLoaded", () => {

  // ---------- NAVBAR ----------
  const navItems = document.querySelectorAll(".nav-item");
  const navBtn = document.querySelector(".navbar button");

  if (navItems.length >= 4) {
    navItems[0].addEventListener("click", () => window.location.href = "Home.html");
    navItems[1].addEventListener("click", () => window.location.href = "Notes.html");
    navItems[2].addEventListener("click", () => window.location.href = "Events.html");
    navItems[3].addEventListener("click", () => window.location.href = "Profile.html");
    navItems[4].addEventListener("click", () => window.location.href = "Registered.html");

  }

  if (navBtn) {
    navBtn.addEventListener("click", () => window.location.href = "Login.html");
  }

  // ---------- JOIN & SIGNUP ----------
  const joinBtn = document.querySelector(".hero .btn");
  const signupBtn = document.querySelector(".cta button");

  if (joinBtn) joinBtn.addEventListener("click", () => window.location.href = "Signup.html");
  if (signupBtn) signupBtn.addEventListener("click", () => window.location.href = "Signup.html");

  // ---------- ADD REVIEW ----------
  const reviewName = document.getElementById("reviewName");
  const reviewCourse = document.getElementById("reviewCourse");
  const reviewText = document.getElementById("reviewText");
  const submitReviewBtn = document.getElementById("submitReviewBtn");
  const reviewContainer = document.querySelector(".test .card-container");
  const imageInput = document.getElementById("reviewImage");

  if (submitReviewBtn && reviewContainer) {

    // ⭐ Star select dropdown
    const starSelect = document.createElement("select");
    starSelect.id = "reviewStars";
    starSelect.innerHTML = `
      <option value="">⭐ Rate Us</option>
      <option value="⭐">⭐</option>
      <option value="⭐⭐">⭐⭐</option>
      <option value="⭐⭐⭐">⭐⭐⭐</option>
      <option value="⭐⭐⭐⭐">⭐⭐⭐⭐</option>
      <option value="⭐⭐⭐⭐⭐">⭐⭐⭐⭐⭐</option>
    `;
    submitReviewBtn.insertAdjacentElement("beforebegin", starSelect);

    // --------- LOAD EXISTING REVIEWS ----------
    let savedReviews = JSON.parse(localStorage.getItem("reviews")) || [];
    savedReviews.forEach((review) => addReviewToUI(review));

    // --------- ADD NEW REVIEW ----------
    submitReviewBtn.addEventListener("click", () => {
      const name = reviewName.value.trim();
      const course = reviewCourse.value.trim();
      const text = reviewText.value.trim();
      const stars = starSelect.value;
      const imageFile = imageInput?.files[0];
      const imageURL = imageFile ? URL.createObjectURL(imageFile) : "assets/default.png";

      if (!name || !course || !text || !stars) {
        showPopup("⚠ Please fill all fields and select stars!", "error");
        return;
      }

      const newReview = { name, course, text, stars, imageURL };
      savedReviews.push(newReview);
      localStorage.setItem("reviews", JSON.stringify(savedReviews));

      addReviewToUI(newReview);

      reviewName.value = "";
      reviewCourse.value = "";
      reviewText.value = "";
      starSelect.value = "";
      if (imageInput) imageInput.value = "";

      showPopup("✅ Review added successfully!", "success");
    });

    // --------- FUNCTION TO ADD CARD IN UI ----------
    function addReviewToUI({ name, course, text, stars, imageURL }) {
      const newCard = document.createElement("div");
      newCard.classList.add("card");
      newCard.innerHTML = `
        <img src="${imageURL}" alt="User Image" class="card-img1">
        <div class="card-body">
          <p class="card-text">"${text}"</p>
          <p>${stars}</p>
          <p class="style">-${name} <br/> ${course}</p>
          <div class="review-actions">
            <button class="edit-btn">✏ Edit</button>
            <button class="delete-btn">🗑 Delete</button>
          </div>
        </div>
      `;

      // --- Edit ---
      newCard.querySelector(".edit-btn").addEventListener("click", () => {
        reviewName.value = name;
        reviewCourse.value = course;
        reviewText.value = text;
        starSelect.value = stars;
        newCard.remove();

        savedReviews = savedReviews.filter(r => !(r.name === name && r.text === text));
        localStorage.setItem("reviews", JSON.stringify(savedReviews));

        showPopup("✏ Edit your review and re-submit!", "success");
      });

      // --- Delete ---
      newCard.querySelector(".delete-btn").addEventListener("click", () => {
        newCard.remove();
        savedReviews = savedReviews.filter(r => !(r.name === name && r.text === text));
        localStorage.setItem("reviews", JSON.stringify(savedReviews));
        showPopup("🗑 Review deleted!", "error");
      });

      reviewContainer.appendChild(newCard);
    }
  }

// ---------- POPUP ----------
  function showPopup(message, type) {
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
    popup.style.background =
      type === "success"
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
