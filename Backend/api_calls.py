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

        url = "https://api.imgflip.com/get_memes"

        try:
            response = requests.get(url)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}



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
