/* Configuration */
const API_BASE_URL = 'http://localhost:5000';
const SAVE_ENDPOINT = `${API_BASE_URL}/api/settings`;

/* DOM Element References */
const settingsForm = document.getElementById('settings-form');
const saveButton = document.getElementById('save-button');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');

/* --- UI Utility Functions --- */

/* Showing success or error message */
function showMessage(message, type = 'error'){
    messageBox.className = '';
    messageBox.style.display = 'block';

    if (type === 'success'){
        messageBox.classList.add('message-success');
    }
    else{
        messageBox.classList.add('message-error');
    }

    messageText.textContent = message;

    /* Hiding message after 5 seconds */
    setTimeout(() => {
        messageBox.style.display = 'none';
        messageText.textContent = '';
    }, 5000);
}

/* Setting the save button to loading state (with spinner) or it's normal state */
function setButtonState(button, isLoading, originalText){
    if (isLoading){
        button.disabled = true;
        button.innerHTML = '<span class = "loading-spinner"></span> Saving...'
    }
    else{
        button.disabled = false;
        button.innerHTML = originalText;
    }
}


/* --- Core Logic --- */

