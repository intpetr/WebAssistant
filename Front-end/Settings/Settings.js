/* Configuration */
import api from "../api";
const SAVE_ENDPOINT = `${api}/settings`;
const LOAD_ENDPOINT = `${api}/settings`;

/* DOM Element References */
const settingsForm = document.getElementById("settings-form");
const saveButton = document.getElementById("save-button");
const messageBox = document.getElementById("message-box");
const messageText = document.getElementById("message-text");

/* --- UI Utility Functions --- */

/* Showing success or error message */
function showMessage(message, type = "error") {
  messageBox.className = "";
  messageBox.style.display = "block";

  if (type === "success") {
    messageBox.classList.add("message-success");
  } else {
    messageBox.classList.add("message-error");
  }

  messageText.textContent = message;

  /* Hiding message after 5 seconds */
  setTimeout(() => {
    messageBox.style.display = "none";
    messageText.textContent = "";
  }, 5000);
}

/* Setting the save button to loading state (with spinner) or it's normal state */
function setButtonState(button, isLoading, originalText) {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = '<span class = "loading-spinner"></span> Saving...';
  } else {
    button.disabled = false;
    button.innerHTML = originalText;
  }
}

/* --- Core Logic --- */

/* Fetching the existing preferences of the user */
async function loadInitialPreferences() {
  const allCheckboxes = document.querySelectorAll(
    'input[name="api_preference"]'
  );

  allCheckboxes.forEach((checkbox) => {
    checkbox.checked = true;
  });

  try {
    const response = await fetch(LOAD_ENDPOINT, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const userSettings = data.settings || {};
      const enabledAPIs = userSettings.enabledApis || [];

      if (enabledAPIs.length > 0) {
        allCheckboxes.forEach((checkbox) => {
          checkbox.checked = false;
        });

        enabledAPIs.forEach((apiValue) => {
          const checkbox = document.getElementById(`api-${apiValue}`);
          if (checkbox) {
            checkbox.checked = true;
          }
        });
      } else {
        console.log(
          "User has saved settings, but the list is empty. Showing all checked by default."
        );
      }
    } else if (response.status === 404 || response.status === 401) {
      console.warn(
        "Could not load preferences (401/404). Defaulting to all checked"
      );
    } else {
      console.error(
        `Failed to load the preferences with status: ${response.status}`
      );
      showMessage("Error loading saved preferences.", "error");
    }
  } catch (error) {
    console.error(
      `Network error during initial load. Defaulting to all checked: ${error}`
    );
  }
}

/* Handling form submission. Collecting checked APIs, formating JSON, and sending to backend */
async function handleSavePreferences(e) {
  e.preventDefault();

  const originalText = saveButton.textContent;
  const enabledApis = [];
  const checkboxes = settingsForm.querySelectorAll(
    'input[name="api_preference"]:checked'
  );

  checkboxes.forEach((checkbox) => {
    enabledApis.push(checkbox.value);
  });

  const payload = {
    settings: { enabledApis: enabledApis },
  };

  console.log("JSON payload to be sent: ", payload);

  setButtonState(saveButton, true, originalText);

  try {
    const response = await fetch(SAVE_ENDPOINT, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      showMessage("Preferences saved succesfully", "success");
    } else if (response.status === 401) {
      showMessage(
        "Session expired or unauthorized. Please log in again.",
        "error"
      );
      setTimeout(() => {
        // *** MODIFIED ***
        // Changed from "../Login/Login.html" to the route "/Login/"
        window.location.href = "/Login/";
      }, 1000);
    } else {
      const errorText = response.statusText || "Unknown Error";
      showMessage(
        `Failed to save preferences. Server response: ${response.status} - ${errorText}`,
        "error"
      );
    }
  } catch (error) {
    console.error("Network error during API save:", error);
    showMessage(
      "Could not connect to the API server. Check your network or backend URL."
    );
  } finally {
    setButtonState(saveButton, false, originalText);
  }
}

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  loadInitialPreferences();
  settingsForm.addEventListener("submit", handleSavePreferences);
});
