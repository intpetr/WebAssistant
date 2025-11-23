// Global 'api' variable is loaded from ../api.js
const UPDATE_API_ENDPOINT = `${api}/api/update_personal_api`;
const LOGOUT_ENDPOINT = `${api}/api/logout`;

const apiForm = document.getElementById('api-form');
const apiInput = document.getElementById('api-text');
const doneBtn = document.getElementById('done-btn');
const messageBox = document.getElementById('message-box');
const logoutBtn = document.getElementById('logout-btn');

function showMessage(message, type = 'error') {
    messageBox.textContent = message;
    messageBox.className = type === 'success' ? 'message-success' : 'message-error';
    messageBox.style.display = 'block';
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 5000);
}

async function handleApiSubmit(e) {
    e.preventDefault();
    const text = apiInput.value.trim();

    if (!text) {
        showMessage('Please enter some text.');
        return;
    }

    const originalText = doneBtn.textContent;
    doneBtn.disabled = true;
    doneBtn.textContent = 'Saving...';

    try {
        const response = await fetch(UPDATE_API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ text: text })
        });

        if (response.status === 401) {
            window.location.href = "/Login/";
            return;
        }

        const result = await response.json();

        if (response.ok) {
            showMessage('Saved! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = result.redirect;
            }, 1000);
        } else {
            showMessage(result.error || 'Failed to update API string.');
            doneBtn.disabled = false;
            doneBtn.textContent = originalText;
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage('Network error occurred.');
        doneBtn.disabled = false;
        doneBtn.textContent = originalText;
    }
}

async function handleLogout() {
    try {
        await fetch(LOGOUT_ENDPOINT, { method: "POST", credentials: "include" });
    } catch (error) {
        console.error("Logout failed", error);
    }
    window.location.href = "/Login/";
}

document.addEventListener('DOMContentLoaded', () => {
    if (apiForm) apiForm.addEventListener('submit', handleApiSubmit);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
});