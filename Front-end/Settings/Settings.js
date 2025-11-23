/* Configuration */
const API_BASE_URL = 'http://localhost:5000';
const SAVE_ENDPOINT = `${API_BASE_URL}/api/settings`;
const LOAD_ENDPOINT = `${API_BASE_URL}/api/settings`;

/* DOM Element References */
const settingsForm = document.getElementById("settings-form");
const saveButton = document.getElementById("save-button");
const messageBox = document.getElementById("message-box");
const messageText = document.getElementById("message-text");
// *** NEW DOM REFERENCE ***
const apiList = document.getElementById("api-list");

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

// *** NEW: Utility function to move list items ***
function moveItem(item, direction) {
  const parent = item.parentNode;
  const items = Array.from(parent.querySelectorAll('.api-item'));
  const currentIndex = items.indexOf(item);
  let newIndex = currentIndex;

  if (direction === 'up' && currentIndex > 0) {
    newIndex = currentIndex - 1;
  } else if (direction === 'down' && currentIndex < items.length - 1) {
    newIndex = currentIndex + 1;
  }

  if (newIndex !== currentIndex) {
    // Swap positions in the DOM
    if (direction === 'up') {
      parent.insertBefore(item, items[newIndex]);
    } else if (direction === 'down') {
      parent.insertBefore(item, items[newIndex].nextSibling);
    }
  }
}

/* --- Core Logic --- */

/* Fetching the existing preferences of the user */
async function loadInitialPreferences() {
  const allItems = Array.from(document.querySelectorAll('.api-item'));
  const apiList = document.getElementById("api-list");
  
  // Create a map for quick access
  const itemMap = new Map();
  allItems.forEach(item => {
    itemMap.set(item.getAttribute('data-key'), item);
  });
  
  // Default: check all, keep current DOM order
  allItems.forEach(item => {
    item.querySelector('input[type="checkbox"]').checked = true;
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
      // savedOrder is an array of API keys in the preferred order
      const savedOrder = userSettings.enabledApis || [];
      
      // 1. Clear checks initially (if saved settings exist)
      if (savedOrder.length > 0) {
        allItems.forEach((item) => {
          item.querySelector('input[type="checkbox"]').checked = false;
        });
      } else {
        console.log("User has no saved settings. Showing all checked by default.");
        return; // Use default order if no settings
      }

      // 2. Determine which APIs are *not* in the saved order (for sorting purposes)
      const disabledApis = allItems.filter(item => !savedOrder.includes(item.getAttribute('data-key')));
      
      // 3. Reorder the DOM based on the saved preference
      apiList.innerHTML = ''; // Clear the list
      
      // Insert saved/enabled items in the correct order
      savedOrder.forEach(apiValue => {
        const item = itemMap.get(apiValue);
        if (item) {
          // Re-check the checkbox for enabled items
          item.querySelector('input[type="checkbox"]').checked = true;
          apiList.appendChild(item);
        }
      });
      
      // Append the disabled items (order doesn't matter much here)
      disabledApis.forEach(item => {
        apiList.appendChild(item);
      });

    } else if (response.status === 404 || response.status === 401) {
      console.warn(
        "Could not load preferences (401/404). Defaulting to all checked and original order."
      );
    } else {
      console.error(
        `Failed to load the preferences with status: ${response.status}`
      );
      showMessage("Error loading saved preferences.", "error");
    }
  } catch (error) {
    console.error(
      `Network error during initial load. Defaulting to all checked and original order: ${error}`
    );
  }
}

/* Handling form submission. Collecting checked APIs, formating JSON, and sending to backend */
async function handleSavePreferences(e) {
  e.preventDefault();

  const originalText = saveButton.textContent;
  // *** MODIFIED LOGIC: Get order from DOM, not just checked status ***
  const enabledApis = [];
  
  // Iterate over all list items in their current DOM order
  const allApiItems = document.querySelectorAll('.api-item');
  allApiItems.forEach((item) => {
    const checkbox = item.querySelector('input[name="api_preference"]');
    if (checkbox && checkbox.checked) {
      // The value of the checkbox is the API key
      enabledApis.push(checkbox.value); 
    }
  });

  const payload = {
    // The enabledApis array now implicitly carries the user's preferred order
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
  
  // *** NEW: Event delegation for reorder buttons ***
  apiList.addEventListener('click', (e) => {
    const target = e.target.closest('.move-up-btn, .move-down-btn');
    if (!target) return;
    
    e.preventDefault();
    const apiItem = target.closest('.api-item');
    
    if (target.classList.contains('move-up-btn')) {
      moveItem(apiItem, 'up');
    } else if (target.classList.contains('move-down-btn')) {
      moveItem(apiItem, 'down');
    }
  });
});