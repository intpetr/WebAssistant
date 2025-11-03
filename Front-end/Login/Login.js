// Configuration and State

import api from "../api";
let isLoginMode = true;

// DOM Element References
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const formTitle = document.getElementById("form-title");
const toggleAuthBtn = document.getElementById("toggle-auth-btn");
const messageBox = document.getElementById("message-box");
const messageText = document.getElementById("message-text");
const logInButton = document.getElementById("login-button");
const registerButton = document.getElementById("register-button");

// UI Functions

// Display a message (error or success to the user)
function showMessage(message, type = "error") {
  messageBox.className = "";
  messageBox.style.display = "block";

  if (type === "success") {
    messageBox.classList.add("message-success");
  } else {
    messageBox.classList.add("message-error");
  }

  messageText.textContent = message;

  // Auto-hide the message after 5 seconds
  setTimeout(() => {
    messageBox.style.display = "none";
    messageText.textContent = "";
  }, 5000);
}

// Setting the button state to loading or normal
function setButtonLoadingState(button, isLoading, originalText) {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `<span class="loading-spinner"></span> Sending...`;
  } else {
    button.disabled = false;
    button.innerHTML = originalText;
  }
}

// Toggle between Login and Registration
function toggleAuthMode() {
  isLoginMode = !isLoginMode;

  if (isLoginMode) {
    // Switching to login
    formTitle.textContent = "Login";
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    toggleAuthBtn.textContent = "Need an account? Register here.";
  } else {
    formTitle.textContent = "Register";
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    toggleAuthBtn.textContent = "Already have an account? Log in here.";
  }

  // Clearing messages when toggleing between modes
  messageBox.style.display = "none";
  messageText.textContent = "";
}

// Backend communication with fetch
async function sendAuthRequest(endpoint, data, button) {
  const originalText = button.textContent;
  const url = `${api}${endpoint}`;
  //const originalText = button.textContent;

  setButtonLoadingState(button, true, originalText);

  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "include", // Ensure cookie is sent / received
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (response.ok) {
      // Succesful login / registration
      showMessage(
        result.message ||
          `Success ${endpoint === "/login" ? "Logged in" : "Account created"}`,
        "success"
      );

      if (endpoint === "/login" && result.redirect) {
        window.location.href = result.redirect;
      } else if (endpoint === "/register") {
        toggleAuthMode();
      }
      return; // Success, exit function
    }

    // Server returned an error
    const errorMessage = result.error || `Server Error: ${response.statusText}`;

    showMessage(errorMessage);
  } catch (error) {
    console.error("Network error during API call: ", error);
    showMessage(
      `Network error: Could not connect to the server at ${api}. Check if backend is running`
    );
  } finally {
    setButtonLoadingState(button, false, originalText);
  }
}

// Form handlers
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  // Client-side validation
  if (!username || !password) {
    return showMessage("Please fill in both the username and the password");
  }

  const data = { username, password };
  sendAuthRequest("/login", data, logInButton);
});

registerForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById(
    "confirm-register-password"
  ).value;

  // Client side validation
  if (password.length < 8) {
    return showMessage("Password must be at least 8 characters long.");
  }
  if (password !== confirmPassword) {
    return showMessage("Passwords do not match.");
  }

  const data = { username, email, password };
  sendAuthRequest("/register", data, registerButton);
});

// Event listeners
toggleAuthBtn.addEventListener("click", toggleAuthMode);

document.addEventListener("DOMContentLoaded", () => {
  // Ensuring register form is hidden
  registerForm.style.display = "none";
});
