/* =====================================================
   TASTE OF AFRICA - MAIN SCRIPT
   -----------------------------------------------------
   This one file is linked on every page. Each feature first
   checks that its elements exist on the current page, so the
   same script works everywhere without errors.

   1. localStorage helpers
   2. Dark / light mode toggle
   3. Recipe filter (recipes page)
   4. Add to favorites (recipes page)
   5. Ingredient scaler (recipe pages)
   6. Contact form validation (contact page)
   7. Newsletter signup (footer, every page)
   ===================================================== */


/* =====================================================
   1. LOCALSTORAGE HELPERS
   Wrapped in try/catch because localStorage can be
   blocked (e.g. private browsing). The site still works,
   it just won't remember things.
   ===================================================== */
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


/* =====================================================
   2. DARK / LIGHT MODE TOGGLE
   Adds data-theme="dark" to <html>; the CSS variables in
   styles.css do the rest. The choice is saved so it stays
   the same on every page and after a refresh.
   ===================================================== */
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

// Restore the saved theme as soon as the page loads
let currentTheme = loadFromStorage("theme", "light");
applyTheme(currentTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", function () {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(currentTheme);
    saveToStorage("theme", currentTheme);
  });
}


/* =====================================================
   3. RECIPE FILTER
   Buttons have data-filter, cards have data-region.
   Clicking a button loops through the cards and adds or
   removes the .hidden class. No page reload needed.
   ===================================================== */
const filterButtons = document.querySelectorAll(".filter-btn");
const recipeCards = document.querySelectorAll(".recipe-card");
const emptyMessage = document.getElementById("empty-message");

// Remembers which filter is active, so we can re-apply it
// after a favorite is removed while "My favorites" is selected
let activeFilter = "all";

function applyFilter(filter) {
  activeFilter = filter;
  const favorites = loadFromStorage("favoriteRecipes", []);
  let visibleCount = 0;

  // Loop through every recipe card and decide whether to show it
  recipeCards.forEach(function (card) {
    const region = card.dataset.region;
    const id = card.dataset.id;

    let shouldShow;
    if (filter === "all") {
      shouldShow = true;
    } else if (filter === "favorites") {
      shouldShow = favorites.includes(id);
    } else {
      shouldShow = region === filter;
    }

    if (shouldShow) {
      card.classList.remove("hidden");
      visibleCount++;
    } else {
      card.classList.add("hidden");
    }
  });

  // Show a friendly message if nothing matches
  if (emptyMessage) {
    emptyMessage.classList.toggle("hidden", visibleCount > 0);
  }
}

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    // Move the .active style to the clicked button
    filterButtons.forEach(function (btn) {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    applyFilter(button.dataset.filter);
  });
});


/* =====================================================
   4. ADD TO FAVORITES
   Each card has a .favorite-btn. Clicking it saves or
   removes the card's data-id in localStorage under the
   key "favoriteRecipes", and turns the heart red.
   On page load, saved favorites are restored.
   ===================================================== */
const favoriteButtons = document.querySelectorAll(".favorite-btn");

function updateFavoriteButton(button, isFavorite) {
  button.classList.toggle("is-favorite", isFavorite);
  button.textContent = isFavorite ? "❤️ Saved" : "🤍 Favorite";
  button.setAttribute("aria-pressed", String(isFavorite));
}

// Restore saved favorites when the page loads
const savedFavorites = loadFromStorage("favoriteRecipes", []);

favoriteButtons.forEach(function (button) {
  const card = button.closest(".recipe-card");
  if (!card) return;
  const recipeId = card.dataset.id;

  updateFavoriteButton(button, savedFavorites.includes(recipeId));

  button.addEventListener("click", function () {
    let favorites = loadFromStorage("favoriteRecipes", []);

    if (favorites.includes(recipeId)) {
      // Already a favorite: remove it
      favorites = favorites.filter(function (id) {
        return id !== recipeId;
      });
      updateFavoriteButton(button, false);
    } else {
      // Not a favorite yet: add it
      favorites.push(recipeId);
      updateFavoriteButton(button, true);
    }

    saveToStorage("favoriteRecipes", favorites);

    // If we're viewing "My favorites", update the list straight away
    if (activeFilter === "favorites") {
      applyFilter("favorites");
    }
  });
});


/* =====================================================
   5. INGREDIENT SCALER
   The servings input has data-base (original servings).
   Each .qty span has data-amount (amount for the base).
   New amount = data-amount x (new servings / base servings)
   ===================================================== */
const servingsInput = document.getElementById("servings");
const quantities = document.querySelectorAll(".qty");

// Turns numbers like 0.5 into ½ so recipes read naturally
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

  // Anything else: round to one decimal place
  return String(Math.round(value * 10) / 10);
}

if (servingsInput && quantities.length > 0) {
  const baseServings = Number(servingsInput.dataset.base);

  function updateQuantities() {
    const servings = Number(servingsInput.value);

    // Ignore empty or invalid numbers while the user is typing
    if (!servings || servings < 1) return;

    quantities.forEach(function (qty) {
      const baseAmount = Number(qty.dataset.amount);
      const newAmount = baseAmount * (servings / baseServings);
      qty.textContent = formatAmount(newAmount);
    });
  }

  servingsInput.addEventListener("input", updateQuantities);

  // Show the formatted amounts (e.g. ½ instead of 0.5) on load
  updateQuantities();
}


/* =====================================================
   6. CONTACT FORM VALIDATION
   The browser's built-in validation runs first (required
   fields, email format). Then JavaScript intercepts the
   submit, checks the message is more than 20 characters,
   and shows a personalised thank-you message.
   ===================================================== */
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

  // Live character counter while typing
  messageInput.addEventListener("input", function () {
    const length = messageInput.value.trim().length;
    messageCount.textContent =
      length + (length === 1 ? " character" : " characters");

    if (length > MIN_LENGTH) {
      clearMessageError();
    }
  });

  contactForm.addEventListener("submit", function (event) {
    // Stop the form from submitting and reloading the page
    event.preventDefault();

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    // Custom rule: message must be MORE than 20 characters
    if (message.length <= MIN_LENGTH) {
      showMessageError(
        "Please write a little more: your message needs more than " +
          MIN_LENGTH +
          " characters (you have " +
          message.length +
          ")."
      );
      messageInput.focus();
      return;
    }

    clearMessageError();

    // Build the confirmation message with the user's name.
    // textContent is used (not innerHTML) so typed text can't inject HTML.
    confirmation.innerHTML = "";

    const heading = document.createElement("h2");
    heading.textContent = "Thank you, " + name + "! We've received your message.";

    const note = document.createElement("p");
    note.textContent = "We'll get back to you within two working days.";

    confirmation.appendChild(heading);
    confirmation.appendChild(note);

    // Hide the form and show the confirmation
    contactForm.classList.add("hidden");
    confirmation.classList.remove("hidden");
  });
}


/* =====================================================
   7. NEWSLETTER SIGNUP (footer)
   Not a real mailing list - this just shows a thank-you
   message so the form gives feedback instead of reloading.
   ===================================================== */
const newsletterForm = document.getElementById("newsletter-form");

if (newsletterForm) {
  newsletterForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Remove any earlier message so they don't stack up
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