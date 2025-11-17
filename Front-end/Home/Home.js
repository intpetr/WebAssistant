// The global 'api' variable is loaded from ../api.js in the HTML
const DASHBOARD_ENDPOINT = `${api}/api/dashboard`;
const HOME_DATA_ENDPOINT = `${api}/api/home_data`;
const LOGOUT_ENDPOINT = `${api}/api/logout`;
// --- NEW ENDPOINTS ---
const RECOMMENDATION_ENDPOINT = `${api}/api/recommendations`;
const POSTS_ENDPOINT = `${api}/api/posts`;


// DOM element references
const cardsContainer = document.getElementById("api-cards-container");
const loginRegisterBtn = document.getElementById("login-register-btn");
const logoutBtn = document.getElementById("logout-btn");
// --- NEW DOM REFERENCES ---
const recommendationContent = document.getElementById("ai-recommendation-content");
const postsList = document.getElementById("posts-list");
// --- REMOVED: Reference for the old currency card ---
// const currencyCardContent = document.getElementById("currency-card-content"); 
// --- NEW DOM REFERENCES FOR CREATE POST ---
const createPostForm = document.getElementById("create-post-form");
const postTextarea = document.getElementById("post-textarea");
const postSubmitBtn = document.getElementById("post-submit-btn");
const postCancelBtn = document.getElementById("post-cancel-btn");
const postMessageBox = document.getElementById("post-message-box");


/* Data Rendering Functions */

// --- REMOVED: renderCurrencyCard function is no longer needed ---

/**
 * Creates HTML content for the main dashboard cards.
 * @param {string} key - The API key (e.g., "weather", "meme").
 * @param {object} data - The data object for that API.
 * @returns {string} HTML string for the card content.
 */
function createCardContent(key, data) {
    if (data.error) {
        return `<p class="error-message"> Error fetching data: ${data.error} </p>`;
    }

    // Specific rendering logic for each api
    switch (key) {
        case "weather":
            const current = data.current_weather;
            if (!current)
                return `<p> Weather data format error </p>`;
            return `
                <p> Temperature: <strong>${current.temperature} °C </strong></p>
                <p> Wind speed: ${current.windspeed} km/h </p>
                <p> Wind direction: ${current.winddirection} °</p>
            `;

        // *** NEW: "currency" case added back ***
        case "currency":
            if (data.error || !data.success) {
                return `<p class="error-message">Error fetching currency data: ${data.error || 'API request failed.'}</p>`;
            }

            // 1. Get Base Currency and Timestamp
            const base = data.source || "USD";
            const date = new Date(data.timestamp * 1000);
            const formattedDate = date.toLocaleString([], {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // 2. Define which currencies to display
            const currenciesToShow = [
                { key: 'USDHUF', label: 'HUF' },
                { key: 'USDEUR', label: 'EUR' },
                { key: 'USDJPY', label: 'JPY' },
                { key: 'USDGBP', label: 'GBP' }
            ];

            // 3. Build the HTML list of rates
            const ratesListHtml = currenciesToShow.map(currency => {
                const rate = data.quotes[currency.key];
                if (!rate) {
                    return `<li class="currency-list-item">
                                <span>${currency.label}</span>
                                <span class="rate-value-error">N/A</span>
                            </li>`;
                }
                return `<li class="currency-list-item">
                            <span class="currency-label">${currency.label}</span>
                            <span class="rate-value">${rate.toFixed(4)}</span>
                        </li>`;
            }).join("");

            // 4. Build the final card content
            // This HTML will be placed inside the .card-content div
            return `
                <p class="currency-base-text">
                    Base Currency: <strong class="base-value">${base}</strong>
                </p>
                <ul class="currency-list">
                    ${ratesListHtml}
                </ul>
                <div class="currency-footer">
                    Last Updated: ${formattedDate}
                </div>
            `;
        // *** END OF NEW "currency" case ***

        case "meme":
            // The 'data' object itself is the meme data: { title, url, ... }
            if (data && data.url) {
                return `<img src="${data.url}" alt="${
                    data.title || "Daily Meme"
                }" style="max-width: 100%; height: auto; border-radius: 5px;">`;
            }
            if (data.error) {
                 return `<p class="error-message"> Error fetching meme: ${data.error} </p>`;
            }
            return `<p>No meme available.</p>`;

        case "stock":
            if (Array.isArray(data) && data.length > 0) {
                const topStocks = data
                    .slice(0, 3)
                    .map((s) => {
                        const changeClass =
                            s.change > 0
                                ? "text-success-green"
                                : s.change < 0
                                ? "text-error-red"
                                : "";
                        return `
                            <p>
                            <strong>${s.symbol}:</strong> $${s.current_price} 
                            <span class="${changeClass}">(${s.percent_change}%)</span>
                            </p>
                        `;
                    })
                    .join("");
                return topStocks;
            }
            return `<p> Stock data not avaliable </p>`;

        case "news":
            if (data.results && data.results.length > 0) {
                const article = data.results[0];
                return `
                        <p><strong>${article.title}</strong></p>
                        <p>${
                            article.description
                                ? article.description.substring(
                                      0,
                                      100
                                  ) + "..."
                                : "No summary available."
                        }</p>
                        <a href="${
                            article.link
                        }" target="_blank" class="read-more">Read More &raquo;</a>
                `;
            }
            return "<p> No news articles found </p>";

        case "moon":
            return `
                    <p>Phase: <strong>${
                        data.moon_phase || "N/A"
                    }</strong></p>
                    <p>Illumination: ${
                        data.moon_illumination || "N/A"
                    }</p>
                    <p>Sunrise: ${
                        data.sunrise || "N/A"
                    } / Moonrise: ${data.moonrise || "N/A"}</p>
            `;

        // *** MODIFIED: Updated flight card logic ***
        case "flight":
            if (data.data && data.data.length > 0) {
                // Get the top 3 flights as requested
                const topFlights = data.data.slice(0, 3);
                
                // Map them to HTML elements
                const flightListHtml = topFlights.map(flight => {
                    const airline = flight.airline.name || "N/A";
                    const flightNum = flight.flight.iata || flight.flight.number || "N/A";
                    const destination = flight.arrival.airport || "N/A";
                    const destIata = flight.arrival.iata || "";

                    // Format scheduled time (e.g., "2025-11-17T06:20:00+00:00")
                    let scheduledTime = "N/A";
                    if (flight.departure.scheduled) {
                        try {
                            const date = new Date(flight.departure.scheduled);
                            scheduledTime = date.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                        } catch (e) {
                            console.error("Error parsing flight date", e);
                        }
                    }

                    return `
                        <div class="flight-item">
                            <p class="flight-airline"><strong>${airline}</strong> (${flightNum})</p>
                            <p class="flight-dest">To: ${destination} (${destIata})</p>
                            <p class="flight-time">Scheduled: ${scheduledTime}</p>
                        </div>
                    `;
                }).join(""); // Join all flight items together

                return flightListHtml;
            }
            return `<p>No flight data available.</p>`;
        // *** END OF MODIFICATION ***

        case "prayer":
            return `<p>Daily prayer feature is enabled but not yet connected to a data source.</p>`;

        default:
            return `<p>API data received, but no specific renderer exists for '${key}'.</p>`;
    }
}

// Render a single API card into the container
function renderCard(apiItem) {
    const card = document.createElement("div");
    card.className = "api-card";
    // --- NEW: Add a data-key attribute for styling ---
    card.setAttribute('data-key', apiItem.key);

    const content = createCardContent(apiItem.key, apiItem.data);

    card.innerHTML = `
            <h2 class="card-title">${apiItem.title}</h2>
            <div class="card-content">
                ${content}
            </div>
    `;
    cardsContainer.appendChild(card);
}

// Fetching user settings and data from the backend
async function loadDashboardData() {
    cardsContainer.innerHTML = `<p class="loading-message"> Fetching your personalized data </p>`;

    try {
        const response = await fetch(HOME_DATA_ENDPOINT, {
            method: "GET",
            credentials: "include",
        });

        if (response.status === 401) {
            window.location.href = "/Login/";
            return;
        }

        if (!response.ok) {
            throw new Error(`Server status: ${response.status}`);
        }

        const data = await response.json(); 
        const apiResults = data.apis || [];

        cardsContainer.innerHTML = "";
        
        // --- *** MODIFIED LOGIC *** ---
        // Reverted to the simple version.
        // The 'currency' card is now rendered just like all other cards.
        
        if (apiResults.length === 0) {
            cardsContainer.innerHTML = `
                <p class="loading-message">
                    No APIs enabled. Please go to 
                    <a href="/Settings/" class="movement-button" style="text-decoration:none; margin: 10px;">Settings</a> 
                    to choose what you want to see.
                </p>`;
        } else {
            // Render all cards, including the currency card
            apiResults.forEach(renderCard);
        }
        // --- *** END OF MODIFIED LOGIC *** ---

        handleAuthStatus(true);

    } catch (error) {
        console.error("Error loading dashboard data", error);
        cardsContainer.innerHTML = `<p class="loading-message error-message">Failed to load dashboard data. Network error or server issue.</p>`;
        // --- REMOVED: No longer need to update separate currency card on error ---
        handleAuthStatus(false); // Assume auth failed if network error
    }
}

// --- Load AI Recommendations ---
async function loadAiRecommendation() {
    if (!recommendationContent) return;
    
    recommendationContent.innerHTML = `<p class="loading-message">Loading recommendations...</p>`;
    try {
        const response = await fetch(RECOMMENDATION_ENDPOINT, {
            method: "GET",
            credentials: "include"
        });

        if (response.status === 401) {
             recommendationContent.innerHTML = `<p class="error-message">Please log in to see recommendations.</p>`;
             return;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server status: ${response.status}`);
        }

        const data = await response.json();
        
        // Format the plain text response with line breaks
        const formattedText = data.events.replace(/\n/g, '<br>');
        recommendationContent.innerHTML = `<p>${formattedText}</p>`;

    } catch (error) {
        console.error("Error loading recommendations:", error);
        recommendationContent.innerHTML = `<p class="error-message">Could not load recommendations.</p>`;
    }
}

// --- NEW: Show Post-specific Message ---
/**
 * Displays a message in the post form's message box.
 * @param {string} message The text to display.
 * @param {'success' | 'error'} type The type of message.
 */
function showPostMessage(message, type = "error") {
    if (!postMessageBox) return;
    postMessageBox.textContent = message;
    postMessageBox.className = `message-${type} show`;

    // Hide after 5 seconds
    setTimeout(() => {
        postMessageBox.className = "hidden";
        postMessageBox.textContent = "";
    }, 5000);
}

// --- NEW: Handle Create Post ---
async function handleCreatePost(e) {
    e.preventDefault(); // Prevent default form submission
    if (!postTextarea || !postSubmitBtn) return;

    const text = postTextarea.value.trim();
    if (!text) {
        showPostMessage("Post content cannot be empty.", "error");
        return;
    }

    const originalButtonText = postSubmitBtn.textContent;
    postSubmitBtn.disabled = true;
    postSubmitBtn.textContent = "Posting...";

    try {
        const response = await fetch(POSTS_ENDPOINT, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        // Post created successfully
        showPostMessage("Post created successfully!", "success");
        postTextarea.value = ""; // Clear the textarea
        loadPosts(); // Refresh the posts list

    } catch (error) {
        console.error("Error creating post:", error);
        showPostMessage(error.message, "error");
    } finally {
        postSubmitBtn.disabled = false;
        postSubmitBtn.textContent = originalButtonText;
    }
}


// --- Load Recent Posts (UPDATED) ---
async function loadPosts() {
    if (!postsList) return;

    postsList.innerHTML = `<p class="loading-message">Loading posts...</p>`;
    try {
        const response = await fetch(POSTS_ENDPOINT, {
            method: "GET",
            credentials: "include"
        });

        if (response.status === 401) {
             postsList.innerHTML = `<p class="error-message">Please log in to see posts.</p>`;
             return;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server status: ${response.status}`);
        }

        const posts = await response.json();
        
        if (!posts || posts.length === 0) {
            postsList.innerHTML = `<p>No posts found yet.</p>`;
            return;
        }

        // Build HTML for the top posts, now including the 'likes' count
        postsList.innerHTML = posts.map(post => `
            <div class="post-item" data-post-id="${post.id}">
                <div class="post-details">
                    <!-- MODIFIED: Turned the username into a link -->
                    <a href="/users/${post.username}" class="post-username-link">
                        <span class="post-username">${post.username}</span>
                    </a>
                    <p class="post-text">${post.text}</p>
                </div>
                <button class="like-btn" data-post-id="${post.id}" data-liked="false">
                    <i class="fa-regular fa-heart"></i> ${post.likes}
                </button>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error loading posts:", error);
        postsList.innerHTML = `<p class="error-message">Could not load posts.</p>`;
    }
}

// --- Handle Like Button Click (IMPLEMENTED) ---
async function handleLikeClick(e) {
    const likeButton = e.target.closest('.like-btn');
    if (!likeButton) return;

    const postId = likeButton.dataset.postId;
    const isLiked = likeButton.dataset.liked === 'true';

    // If already liked in this session, do nothing.
    if (isLiked) {
        console.log("Already liked this post in this session.");
        return;
    }

    // Disable button to prevent double-clicking
    likeButton.disabled = true;

    try {
        const response = await fetch(`${POSTS_ENDPOINT}/${postId}/like`, {
            method: "POST",
            credentials: "include", // Send cookies
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        // The backend returns the updated post object
        const updatedPost = await response.json();

        // Update the button visually to show it's "liked"
        likeButton.dataset.liked = 'true';
        likeButton.innerHTML = `<i class="fa-solid fa-heart"></i> ${updatedPost.likes}`;
        likeButton.style.color = 'var(--white)';
        likeButton.style.backgroundColor = 'var(--error-red)';
        
        // Keep the button disabled for this session
        // likeButton.disabled = false; // <-- We keep it disabled

    } catch (error) {
        console.error(`Failed to like post ${postId}:`, error);
        // Re-enable button if the request failed so user can try again
        likeButton.disabled = false;
    }
}


// Function to handle showing/hiding the Login/Register button
function handleAuthStatus(isLoggedIn) {
    if (isLoggedIn) {
        // Hide Login/Register, Show Logout
        if (loginRegisterBtn) loginRegisterBtn.classList.add("hidden");
        if (logoutBtn) logoutBtn.classList.remove("hidden");
    } else {
        // Show Login/Register, Hide Logout
        if (loginRegisterBtn)
            loginRegisterBtn.classList.remove("hidden");
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

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    // 1. Load all dynamic content concurrently
    loadDashboardData(); // This will now also trigger renderCurrencyCard
    loadAiRecommendation();
    loadPosts();

    // 2. Attach logout listener
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }

    // 3. Attach like button listener (using event delegation)
    if (postsList) {
        postsList.addEventListener('click', handleLikeClick);
    }

    // --- NEW: Attach Create Post Listeners ---
    if (createPostForm) {
        createPostForm.addEventListener("submit", handleCreatePost);
    }
    if (postCancelBtn) {
        postCancelBtn.addEventListener("click", () => {
            if (postTextarea) postTextarea.value = "";
            if (postMessageBox) {
                postMessageBox.className = "hidden";
                postMessageBox.textContent = "";
            }
        });
    }
});