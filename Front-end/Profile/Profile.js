// The global 'api' variable is loaded from ../api.js
const LOGOUT_ENDPOINT = `${api}/api/logout`;

// --- DOM References ---
const profileUsernameTitle = document.getElementById("profile-username-title");
const postsList = document.getElementById("profile-posts-list");
const infoContent = document.getElementById("profile-info-content");
const loginRegisterBtn = document.getElementById("login-register-btn");
const logoutBtn = document.getElementById("logout-btn");

/**
 * Renders the user's basic info into the 'About' card.
 * @param {object} user - The user object from the API.
 */
function renderProfileInfo(user) {
    if (!infoContent) return;

    // --- MODIFICATION: Build the interests list ---
    let interestsHTML = '';
    const interests = user.enabledApis; // Get interests from the API response

    if (interests && interests.length > 0) {
        // Helper function to capitalize first letter
        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        
        const formattedInterests = interests.map(capitalize).join(', ');
        interestsHTML = `<p><strong>Interests:</strong> ${formattedInterests}</p>`;
    }
    // --- END MODIFICATION ---

    infoContent.innerHTML = `
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        ${interestsHTML} <!-- MODIFIED: Added interests HTML here -->
    `;
    
    // Set the main page title
    if (profileUsernameTitle) {
        profileUsernameTitle.textContent = `${user.username}'s Profile`;
    }
}

/**
 * Renders the user's posts into the 'Posts' list.
 * @param {Array} posts - An array of post objects from the API.
 */
function renderPosts(posts) {
    if (!postsList) return;

    if (!posts || posts.length === 0) {
        postsList.innerHTML = `<p>This user hasn't posted anything yet.</p>`;
        return;
    }

    // Build HTML for all posts
    postsList.innerHTML = posts.map(post => `
        <div class="post-item" data-post-id="${post.id}">
            <div class="post-details">
                <!-- No username link needed here, as we are on their page -->
                <p class="post-text">${post.text}</p>
            </div>
            <!-- We can still show likes -->
            <div class="like-btn" data-post-id="${post.id}">
                <i class="fa-regular fa-heart"></i> ${post.likes}
            </div>
        </div>
    `).join("");
}

/**
 * Fetches the profile data (user info and posts) from the backend.
 */
async function loadProfileData() {
    // 1. Get username from the URL (e.g., "/users/peter")
    const pathParts = window.location.pathname.split('/');
    const username = pathParts[pathParts.length - 1];

    if (!username) {
        profileUsernameTitle.textContent = "Cannot find user";
        postsList.innerHTML = `<p class="error-message">No username specified in the URL.</p>`;
        return;
    }

    // 2. Set loading states
    postsList.innerHTML = `<p class="loading-message">Loading posts...</p>`;
    infoContent.innerHTML = `<p class="loading-message">Loading info...</p>`;

    // 3. Fetch data from the new API endpoint
    try {
        const response = await fetch(`${api}/api/users/${username}`, {
            method: "GET",
            credentials: "include",
        });

        if (response.status === 401) {
            // Not logged in, redirect to login
            window.location.href = "/Login/";
            return;
        }

        if (response.status === 404) {
            // User not found
            const errorData = await response.json();
            profileUsernameTitle.textContent = "User Not Found";
            postsList.innerHTML = `<p class="error-message">${errorData.error}</p>`;
            infoContent.innerHTML = "";
            return;
        }

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        
        // 4. Render the data
        renderProfileInfo(data.user); // data.user now contains interests
        renderPosts(data.posts);
        handleAuthStatus(true); // User is logged in

    } catch (error) {
        console.error("Error loading profile data:", error);
        profileUsernameTitle.textContent = "Error";
        postsList.innerHTML = `<p class="error-message">Failed to load profile data.</p>`;
        infoContent.innerHTML = "";
        handleAuthStatus(false);
    }
}

// --- Auth Functions (copied from Home.js) ---

function handleAuthStatus(isLoggedIn) {
    if (isLoggedIn) {
        if (loginRegisterBtn) loginRegisterBtn.classList.add("hidden");
        if (logoutBtn) logoutBtn.classList.remove("hidden");
    } else {
        if (loginRegisterBtn) loginRegisterBtn.classList.remove("hidden");
        if (logoutBtn) logoutBtn.classList.add("hidden");
    }
}

async function handleLogout() {
    try {
        await fetch(LOGOUT_ENDPOINT, {
            method: "POST",
            credentials: "include",
        });
    } catch (error) {
        console.error("Logout request failed: ", error);
    }
    window.location.href = "/Login/";
}

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Load the profile data
    loadProfileData();

    // 2. Attach logout listener
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }
    
    // Note: Like functionality is not wired up on this page,
    // but could be added by copying the handleLikeClick function from Home.js
});