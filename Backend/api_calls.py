import requests
import time


class ApiCalls:
    @staticmethod
    def get_current_weather():
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": 47.4979,
            "longitude": 19.0402,
            "current_weather": "true"
        }

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}

    @staticmethod
    def get_meme():
        url = "https://meme-api.com/gimme/wholesomememes"

        response = requests.get(url)

        meme_data = response.json()

            # This API provides a lot of data. We'll return the most useful parts.
            # 'url' is the direct link to the meme image.
        return {
                "title": meme_data.get("title"),
                "url": meme_data.get("url"),
                "subreddit": meme_data.get("subreddit"),
                "author": meme_data.get("author")
            }

    @staticmethod
    def get_moon_phase():
        url = "https://api.farmsense.net/v1/moonphases/"
        current_timestamp = int(time.time())
        params = {"d": current_timestamp}

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}

    @staticmethod
    def get_currency():
        API_KEY = "3335b42684890616b2972231f4ad529c"
        base_url = "https://api.exchangerate.host/live"

        params = {
            'base': 'USD',
            'symbols': 'HUF',
            'access_key': API_KEY
        }

        try:
            response = requests.get(base_url, params=params)
            response.raise_for_status()
            data = response.json()

            if data.get('success') is False:
                return {"error": data.get("error", "API returned success=false")}

            return data
        except requests.RequestException as e:
            return {"error": str(e)}

    # --- NEW METHOD BELOW ---
    @staticmethod
    def get_latest_news(query="technology", country="hu", language="en"):
        """
        Fetches news articles from NewsData.io API.
        You must replace YOUR_API_KEY_HERE with your actual key from https://newsdata.io/
        """
        API_KEY = "YOUR_API_KEY_HERE"  # <-- Fill in your key here
        url = "https://newsdata.io/api/1/news"

        params = {
            "apikey": 'pub_315ce4900bda4c74a439cb6d448621cc',
            "q": query,           # Keyword to search for
            "country": country,   # Country code (e.g., 'us', 'hu')
            "language": language  # Language code (e.g., 'en', 'hu')
        }

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}

    @staticmethod
    def get_flights_from_budapest(limit=10):
        """
        Fetches flights departing from Budapest (BUD) using the AviationStack API.
        Replace YOUR_API_KEY_HERE with your key from https://aviationstack.com/
        You can adjust the 'limit' to control how many flight records are returned.
        """

        API_KEY = "5a51064a1b4ff10042c5bf460544ac86"  # <-- Fill in your AviationStack API key
        url = "http://api.aviationstack.com/v1/flights"

        params = {
        "access_key": API_KEY,  # <-- MODIFIED: Uses the variable now
        "dep_iata": "BUD",  # Only flights departing from Budapest
        "limit": limit  # Number of records to fetch
    }

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()

        # Optional: handle API-level errors
            if "error" in data:
                return {"error": data["error"]}

            return data
        except requests.RequestException as e:
            return {"error": str(e)}
    import requests
    @staticmethod
    def get_moon_data_debrecen():
        """
        Fetches moon phase, moonrise, moonset, illumination, sunrise, and sunset
        for Debrecen, Hungary using the IP Geolocation Astronomy API.
        Documentation: https://ipgeolocation.io/astronomy-api.html
        Requires a free API key.
        """
        API_KEY = "eadb5addc0ca4d048b50300b7e593a6e"  # <-- replace with your key
        url = "https://api.ipgeolocation.io/astronomy"

        params = {
            "apiKey": API_KEY,
            "lat": 47.5316,   # Debrecen latitude
            "long": 21.6273   # Debrecen longitude
        }

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            # Extract relevant fields from the response
            return data

        except requests.RequestException as e:
            return {"error": str(e)}

    @staticmethod
    def get_most_popular_stocks(symbols=None):
        """
        Fetches current price and daily change for a list of popular stocks using Finnhub API.
        Must replace 'YOUR_API_KEY_HERE' with your Finnhub API key.

        Since free plan does not support /stock/actives, we provide a hardcoded popular symbols list.
        """
        API_KEY = "d3mc1gpr01qkjssf7p7gd3mc1gpr01qkjssf7p80"
        if symbols is None:
            # A simple list of popular US stocks
            symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "NFLX", "BRK.B", "V"]

        popular_stocks = []

        for symbol in symbols:
            url = "https://finnhub.io/api/v1/quote"
            params = {"symbol": symbol, "token": API_KEY}

            try:
                response = requests.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                popular_stocks.append({
                    "symbol": symbol,
                    "current_price": data.get("c"),
                    "change": data.get("d"),
                    "percent_change": data.get("dp"),
                    "high": data.get("h"),
                    "low": data.get("l"),
                    "open": data.get("o"),
                    "previous_close": data.get("pc")
                })

            except requests.RequestException as e:
                popular_stocks.append({"symbol": symbol, "error": str(e)})

        return popular_stocks