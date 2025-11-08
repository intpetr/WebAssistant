// Configuration and State

const API_BASE_URL = 'http://localhost:5000';
const MAX_TRIES = 3;
let isLoginMode = true;

// DOM Element References
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const formTitle = document.getElementById('form-title');
const toggleAuthBtn = document.getElementById('toggle-auth-btn');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');
const logInButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');

// UI Functions

// Display a message (error or success to the user)
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

    // Auto-hide the message after 5 seconds
    setTimeout(() => {
        messageBox.style.display = 'none';
        messageText.textContent = '';
    }, 5000);
}

// Setting the button state to loading or normal
function setButtonLoadingState(button, isLoading, originalText){
    if (isLoading){
        button.disabled = true;
        button.innerHTML = `<span class="loading-spinner"></span> Sending...`;
    }
    else{
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

// Toggle between Login and Registration
function toggleAuthMode(){
    isLoginMode = !isLoginMode;

    if (isLoginMode){
        // Switching to login
        formTitle.textContent = 'Login';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        toggleAuthBtn.textContent = 'Need an account? Register here.';
    }
    else{
        formTitle.textContent = 'Register';
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        toggleAuthBtn.textContent = 'Already have an account? Log in here.'
    }

    // Clearing messages when toggleing between modes
    messageBox.style.display = 'none';
    messageText.textContent = '';
}

// Backend communication with fetch
async function sendAuthRequest(endpoint, data, button) {
    const originalText = button.textContent;
    const url = `${API_BASE_URL}${endpoint}`;
    //const originalText = button.textContent;

    setButtonLoadingState(button, true, originalText);

    for (let attempt = 0; attempt < MAX_TRIES; attempt++){
        try {
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include', // Ensure cookie is sent/received
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify(data)
            });
            const result = await response.json();

            if(response.ok){
                // Successful login/registration
                showMessage(result.message || `Success ${endpoint === '/api/login' ? 'Logged in' : 'Account Created'}`, 'success');

                // FIX: Use the 'redirect' URL provided by the server
                if (endpoint === '/api/login' && result.redirect) {
                    window.location.href = result.redirect;
                } else if (endpoint === '/register') {
                    // Optionally switch to login view or redirect after successful registration
                    toggleAuthMode();
                }

                setButtonLoadingState(button, false, originalText);
                return; // Exiting successfully
            }

            // Handling HTTP error responses
            const errorMessage = result.error || `Server Error: ${response.statusText}`;

            showMessage(errorMessage);
            setButtonLoadingState(button, false, originalText);
            return; // Exiting after processing server error
        }
        catch(error){
            console.error('Fetch error: ', error);

            // Retrying if it's a network related error
            if(attempt < MAX_TRIES - 1){
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            else{
                showMessage(`Network error: Could not connect to the server at ${API_BASE_URL}. Check if backend is running`);
                setButtonLoadingState(button, false, originalText);
            }
        }
    }
}

// Form handlers
loginForm.addEventListener('submit', function(e){
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // Client-side validation
    if (!username || !password){
        return showMessage('Please fill in both the username and the password');
    }

    const data = {username, password};
    sendAuthRequest('/api/login', data, logInButton);
});

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-register-password').value;

    // Client side validation
    if (password.length < 8){
        return showMessage('Password must be at least 8 characters long.');
    }
    if (password !== confirmPassword){
        return showMessage('Passwords do not match.');
    }

    const data = {username, email, password};
    sendAuthRequest('/register', data, registerButton);
})

// Event listeners
toggleAuthBtn.addEventListener('click', toggleAuthMode);

document.addEventListener('DOMContentLoaded', () => {
    // Ensuring register form is hidden
    registerForm.style.display = 'none';
})
