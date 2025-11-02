const API_BASE_URL = 'http://localhost:5000';
const DASHBOARD_ENDPOINT = `${API_BASE_URL}/dashboard`;

// Function to handle navigation to the settings page
function windowChange(){
    // *** MODIFIED ***
    // Changed from "../Settings/Settings.html" to the route "/Settings/"
    window.location.href = '/Settings/';
}

// Function to check if the user is currently logged in
async function checkAuthentication() {
    try {
        const response = await fetch(DASHBOARD_ENDPOINT, {
            method: 'GET',
            credentials: 'include', // Crucial: must send the cookie
        });

        if (response.status === 401) {
            console.warn("Authentication check failed. Redirecting to login.");
            // If unauthorized, redirect to the login page immediately
            // *** MODIFIED ***
            // Changed from "../Login/Login.html" to the route "/Login/"
            window.location.href = '/Login/';
        } else if (!response.ok) {
            console.error(`Dashboard check failed with status: ${response.status}`);
            // Handle other potential non-auth errors gracefully
        }
        // If response is OK (200), user is authenticated, and the page loads normally.
    } catch (error) {
        console.error('Network error during authentication check:', error);
        // This usually means the server is down, but keep user on page for now.
    }
}

// Run the check when the page loads
document.addEventListener('DOMContentLoaded', checkAuthentication);