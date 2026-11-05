/* Taste of Africa - main script (linked on every page) */

/* localStorage helpers */
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Could not save to localStorage:", error);
  }
}

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.warn("Could not read from localStorage:", error);
    return fallback;
  }
}

/* Dark / light mode */
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  if (themeToggle) {
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }
}

let currentTheme = loadFromStorage("theme", "light");
applyTheme(currentTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", function () {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(currentTheme);
    saveToStorage("theme", currentTheme);
  });
}

/* Hero slideshow */
const heroSlides = document.querySelectorAll(".hero-slide");

if (heroSlides.length > 1) {
  let currentSlide = 0;

  setInterval(function () {
    heroSlides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % heroSlides.length;
    heroSlides[currentSlide].classList.add("active");
  }, 5000);
}

/* Recipe filter */
const filterButtons = document.querySelectorAll(".filter-btn");
const recipeCards = document.querySelectorAll(".recipe-card");
const emptyMessage = document.getElementById("empty-message");
let activeFilter = "all";

function applyFilter(filter) {
  activeFilter = filter;
  const favorites = loadFromStorage("favoriteRecipes", []);
  let visibleCount = 0;

  recipeCards.forEach(function (card) {
    let shouldShow;

    if (filter === "all") {
      shouldShow = true;
    } else if (filter === "favorites") {
      shouldShow = favorites.includes(card.dataset.id);
    } else {
      shouldShow = card.dataset.region === filter;
    }

    card.classList.toggle("hidden", !shouldShow);
    if (shouldShow) visibleCount++;
  });

  if (emptyMessage) {
    emptyMessage.classList.toggle("hidden", visibleCount > 0);
  }
}

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    filterButtons.forEach(function (btn) {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    applyFilter(button.dataset.filter);
  });
});

/* Favorites (saved in localStorage) */
const favoriteButtons = document.querySelectorAll(".favorite-btn");
const savedFavorites = loadFromStorage("favoriteRecipes", []);

function updateFavoriteButton(button, isFavorite) {
  button.classList.toggle("is-favorite", isFavorite);
  button.textContent = isFavorite ? "❤️ Saved" : "🤍 Favorite";
  button.setAttribute("aria-pressed", String(isFavorite));
}

favoriteButtons.forEach(function (button) {
  const card = button.closest(".recipe-card");
  if (!card) return;
  const recipeId = card.dataset.id;

  updateFavoriteButton(button, savedFavorites.includes(recipeId));

  button.addEventListener("click", function () {
    let favorites = loadFromStorage("favoriteRecipes", []);

    if (favorites.includes(recipeId)) {
      favorites = favorites.filter(function (id) {
        return id !== recipeId;
      });
      updateFavoriteButton(button, false);
    } else {
      favorites.push(recipeId);
      updateFavoriteButton(button, true);
    }

    saveToStorage("favoriteRecipes", favorites);

    if (activeFilter === "favorites") {
      applyFilter("favorites");
    }
  });
});

/* Ingredient scaler */
const servingsInput = document.getElementById("servings");
const quantities = document.querySelectorAll(".qty");

function formatAmount(value) {
  const whole = Math.floor(value);
  const remainder = value - whole;
  const fractions = [
    { value: 0.25, symbol: "¼" },
    { value: 0.33, symbol: "⅓" },
    { value: 0.5, symbol: "½" },
    { value: 0.67, symbol: "⅔" },
    { value: 0.75, symbol: "¾" }
  ];

  if (remainder < 0.05) return String(whole);
  if (remainder > 0.95) return String(whole + 1);

  for (const fraction of fractions) {
    if (Math.abs(remainder - fraction.value) < 0.05) {
      return whole > 0 ? whole + " " + fraction.symbol : fraction.symbol;
    }
  }

  return String(Math.round(value * 10) / 10);
}

if (servingsInput && quantities.length > 0) {
  const baseServings = Number(servingsInput.dataset.base);

  function updateQuantities() {
    const servings = Number(servingsInput.value);
    if (!servings || servings < 1) return;

    quantities.forEach(function (qty) {
      const newAmount = Number(qty.dataset.amount) * (servings / baseServings);
      qty.textContent = formatAmount(newAmount);
    });
  }

  servingsInput.addEventListener("input", updateQuantities);
  updateQuantities();
}

/* Contact form validation */
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  const nameInput = document.getElementById("name");
  const messageInput = document.getElementById("message");
  const messageError = document.getElementById("message-error");
  const messageCount = document.getElementById("message-count");
  const confirmation = document.getElementById("confirmation");
  const MIN_LENGTH = 20;

  function showMessageError(text) {
    messageError.textContent = text;
    messageError.classList.remove("hidden");
    messageInput.classList.add("invalid");
  }

  function clearMessageError() {
    messageError.textContent = "";
    messageError.classList.add("hidden");
    messageInput.classList.remove("invalid");
  }

  messageInput.addEventListener("input", function () {
    const length = messageInput.value.trim().length;
    messageCount.textContent = length + (length === 1 ? " character" : " characters");
    if (length > MIN_LENGTH) clearMessageError();
  });

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (message.length <= MIN_LENGTH) {
      showMessageError(
        "Please write a little more: your message needs more than " +
          MIN_LENGTH + " characters (you have " + message.length + ")."
      );
      messageInput.focus();
      return;
    }

    clearMessageError();

    // textContent (not innerHTML) so typed text can't inject HTML
    confirmation.innerHTML = "";
    const heading = document.createElement("h2");
    heading.textContent = "Thank you, " + name + "! We've received your message.";
    const note = document.createElement("p");
    note.textContent = "We'll get back to you within two working days.";
    confirmation.append(heading, note);

    contactForm.classList.add("hidden");
    confirmation.classList.remove("hidden");
  });
}

/* Newsletter signup */
const newsletterForm = document.getElementById("newsletter-form");

if (newsletterForm) {
  newsletterForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const oldMessage = newsletterForm.querySelector(".newsletter-message");
    if (oldMessage) oldMessage.remove();

    const message = document.createElement("p");
    message.className = "newsletter-message";
    message.setAttribute("role", "status");
    message.textContent = "Thanks for subscribing! Delicious recipes are on their way. 🍲";

    newsletterForm.appendChild(message);
    newsletterForm.reset();
  });
}