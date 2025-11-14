//import api from "../api.js";
const DASHBOARD_ENDPOINT = `${api}/api/dashboard`;
const HOME_DATA_ENDPOINT = `${api}/api/home_data`;
const LOGOUT_ENDPOINT = `${api}/api/logout`;

// DOM element references
const cardsContainer = document.getElementById("api-cards-container");
const loginRegisterBtn = document.getElementById("login-register-btn");
const logoutBtn = document.getElementById("logout-btn");

/* Data Rendering Functions */
function createCardContent(key, data) {
        if (data.error) {
                return `<p class="error-message"> Error fetching data: ${data.error} <p/>`;
        }

        // Specific rendering logic for each api
        switch (key) {
                case "weather":
                        const current = data.current_weather;
                        if (!current)
                                return `<p> Weather data format error <p/>`;
                        return `
                                <p> Temperature: <strong>${current.temperature} °C <strong/><p/>
                                <p> Wind speed: ${current.windspeed} km/h <p/>
                                <p> Wind direction: ${currend.winddirection} °<p/>
                        `;

                case "currency":
                        const rate = data.rates ? data.rates.HUF : "N/A";
                        const base = data.base || "USD";
                        return `
                        <p>Base Currency: <strong>${base}</strong></p>
                        <p>1 ${base} = <strong>${rate} HUF</strong></p>
                        <p>Last Updated: ${data.date || "Unknown"}</p>`;

                case "meme":
                        if (
                                data.data &&
                                data.data.memes &&
                                data.data.memes.length > 0
                        ) {
                                const meme = data.data.memes[0];
                                return `<img src="${meme.url}" alt="${meme.name}" style="max-width: 100%; height: auto; border-radius: 5px;">`;
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
                        return `<p> Stock data not avaliable <p/>`;

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
                        return "<p> No news articles found <p/>";

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

                case "flight":
                        if (data.data && data.data.length > 0) {
                                const flight = data.data[0];
                                return `
                                        <p>Airline: <strong>${
                                                flight.airline.name || "N/A"
                                        }</strong></p>
                                        <p>Flight #: ${
                                                flight.flight.number || "N/A"
                                        }</p>
                                        <p>Destination: ${
                                                flight.arrival.airport || "N/A"
                                        }</p>
                                `;
                        }
                        return `<p>No flight data available.</p>`;

                case "prayer":
                        return `<p>Daily prayer feature is enabled but not yet connected to a data source.</p>`;

                default:
                        return `<p>API data received, but no specific renderer exists for '${key}'.</p>`;
        }
}

// Function to handle showing/hiding the Login/Register button
function handleLoginButtonDisplay(isLoggedIn) {
        if (loginRegisterBtn) {
                // Hide the button if user is logged in
                loginRegisterBtn.style.display = isLoggedIn
                        ? "none"
                        : "inline-block";
        }
}

// Function to check if the user is currently logged in
async function checkAuthentication() {
        try {
                const response = await fetch(DASHBOARD_ENDPOINT, {
                        method: "GET",
                        credentials: "include", // Crucial: must send the cookie
                });

                if (response.status === 401) {
                        console.warn(
                                "Authentication check failed. Redirecting to login."
                        );
                        // If unauthorized, redirect to the login page immediately
                        // *** MODIFIED ***
                        // Changed from "../Login/Login.html" to the route "/Login/"
                        window.location.href = "/Login/";
                } else if (!response.ok) {
                        console.error(
                                `Dashboard check failed with status: ${response.status}`
                        );
                        // Handle other potential non-auth errors gracefully
                }
                // If response is OK (200), user is authenticated, and the page loads normally.
        } catch (error) {
                console.error(
                        "Network error during authentication check:",
                        error
                );
                // This usually means the server is down, but keep user on page for now.
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

// Run the check when the page loads
document.addEventListener("DOMContentLoaded", checkAuthentication);
