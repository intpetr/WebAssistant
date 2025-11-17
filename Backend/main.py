import threading

from ollama import Client
from datetime import datetime, time
from flask import Flask, request, jsonify, send_from_directory, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import logging
import os
from flask_cors import CORS
from Models import User, db, Post
from Models import Event
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from Models import Note
import api_calls
import torch
import numpy as np
import pandas as pd
import joblib
from NeuralNet import NeuralNet
import joblib
from Models import AIRecommendation

from flask import Flask, request, jsonify
import sklearn
import schedule
import time
import threading

print(sklearn.__version__)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'Front-end'))
CREDENTIALS_FILE = os.path.join(BASE_DIR, 'credentials.txt')

app = Flask(__name__,
            static_folder=FRONTEND_DIR,
            static_url_path='')

CORS(app, supports_credentials=True,
     origins=["http://localhost:5000", "http://127.0.0.1:5000", "http://127.0.0.1:5500"])

app.secret_key = "supersecretkey"

login_manager = LoginManager()
login_manager.init_app(app)

login_manager.login_view = 'login_page'
client = Client()
cached_api_results = {}


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


@login_manager.unauthorized_handler
def unauthorized():
    if request.path.startswith('/api/'):
        return jsonify({"error": "Unauthorized"}), 401

    return redirect(url_for('login_page'))


# --- NEW ---
# Page-serving route for the profile page
@app.route('/users/<username>')
@login_required
def profile_page(username):
    # It just serves the HTML file. The JS in that file will fetch the data.
    return send_from_directory(app.static_folder, 'Profile/Profile.html')


# --- END NEW ---


@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('home_page'))
    return redirect(url_for('login_page'))


@app.route('/Home/')
@login_required
def home_page():
    return send_from_directory(app.static_folder, 'Home/Home.html')


@app.route('/Login/')
def login_page():
    if current_user.is_authenticated:
        pass
        # return redirect(url_for('home_page'))
    return send_from_directory(app.static_folder, 'Login/Login.html')


@app.route('/Notes/')
@login_required
def notes_page():
    return send_from_directory(app.static_folder, 'Notes/Notes.html')


@app.route('/Calendar/')
@login_required
def calendar_page():
    return send_from_directory(app.static_folder, 'Calendar/Calendar.html')


@app.route('/Settings/')
@login_required
def settings_page():
    return send_from_directory(app.static_folder, 'Settings/Settings.html')


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    new_user = User(username=username, password=password, email=email)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": f"User {username} registered successfully"}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or user.password != password:
        return jsonify({"error": "Invalid credentials"}), 401

    login_user(user, remember=True)
    print(f'User {username} successfully logged in, setting session cookie.')

    return jsonify({
        "message": "Login successful",
        "redirect": url_for('home_page')
    })


@app.route('/api/settings', methods=['GET', 'POST'])
@login_required
def settings():
    user = current_user

    if request.method == 'GET':
        user_settings = getattr(user, 'settings', None)
        settings_data = user_settings.settings if user_settings else None
        return jsonify({"settings": settings_data})

    elif request.method == 'POST':
        data = request.get_json()
        new_settings = data.get('settings')

        if new_settings is None:
            return jsonify({"error": "No settings provided"}), 400

        from Models import UserSettings
        user_settings_obj = getattr(user, 'settings', None)

        if user_settings_obj:
            user_settings_obj.settings = new_settings
        else:
            new_settings_entry = UserSettings(user_id=user.id, settings=new_settings)
            db.session.add(new_settings_entry)

        db.session.commit()
        return jsonify({"message": "Settings updated successfully"})


def combine_date_time(date_str, time_str):
    if not date_str or not time_str:
        return None
    try:
        date_obj = datetime.fromisoformat(date_str).date()
        time_obj = time.fromisoformat(time_str)
        dt = datetime.combine(date_obj, time_obj)
        return dt.astimezone()
    except (ValueError, TypeError):
        return None


@app.route('/api/notes', methods=['GET'])
@login_required
def get_notes():
    try:

        notes_query = current_user.notes.order_by(Note.timestamp.desc())
        notes = notes_query.all()
        notes_list = [note.to_dict() for note in notes]

        return jsonify({"notes": notes_list}), 200

    except Exception as e:
        app.logger.error(f"Error fetching notes for user {current_user.id}: {e}")
        return jsonify({"error": "An error occurred while retrieving notes."}), 500


@app.route('/api/notes', methods=['POST'])
@login_required
def create_note():
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')

    if not content:
        return jsonify({"error": "Note content cannot be empty"}), 400

    try:
        new_note = Note(
            title=title,
            content=content,
            user_id=current_user.id
        )
        db.session.add(new_note)
        db.session.commit()

        return jsonify(new_note.to_dict()), 201

    except Exception as e:
        app.logger.error(f"Error creating note for user {current_user.id}: {e}")
        db.session.rollback()
        return jsonify({"error": "An error occurred while creating the note."}), 500


@app.route('/api/notes/<int:note_id>', methods=['PUT'])
@login_required
def update_note(note_id):
    try:
        note = db.session.get(Note, note_id)

        if not note:
            return jsonify({"error": "Note not found"}), 404

        if note.user_id != current_user.id:
            return jsonify({"error": "Unauthorized to edit this note"}), 403

        data = request.get_json()
        content = data.get('content')

        if not content:
            return jsonify({"error": "Note content cannot be empty"}), 400

        note.title = data.get('title')
        note.content = content

        db.session.commit()

        return jsonify(note.to_dict()), 200

    except Exception as e:
        app.logger.error(f"Error updating note {note_id} for user {current_user.id}: {e}")
        db.session.rollback()
        return jsonify({"error": "An error occurred while updating the note."}), 500


@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
@login_required
def delete_note(note_id):
    try:
        note = db.session.get(Note, note_id)

        if not note:
            return jsonify({"error": "Note not found"}), 404

        if note.user_id != current_user.id:
            return jsonify({"error": "Unauthorized to delete this note"}), 403

        db.session.delete(note)
        db.session.commit()

        return jsonify({"message": "Note deleted successfully!"}), 200

    except Exception as e:
        app.logger.error(f"Error deleting note {note_id} for user {current_user.id}: {e}")
        db.session.rollback()
        return jsonify({"error": "An error occurred while deleting the note."}), 500


@app.route('/api/calendar', methods=['GET', 'POST'])
@login_required
def manage_events():
    if request.method == 'GET':
        try:
            events_query = current_user.events
            events = events_query.order_by(Event.start_time.asc()).all()
            events_list = [event.to_dict() for event in events]

            return jsonify({"events": events_list}), 200

        except Exception as e:
            app.logger.error(f"Error fetching events for user {current_user.id}: {e}")
            return jsonify({"error": "An error occurred while retrieving events."}), 500

    if request.method == 'POST':
        data = request.get_json()

        if not data or not data.get('title') or not data.get('date') or not data.get('startTime'):
            return jsonify({"error": "Title, Date, and Start Time are required."}), 400

        try:

            start_dt = combine_date_time(data['date'], data['startTime'])
            end_dt = combine_date_time(data['date'], data.get('endTime'))

            if start_dt is None:
                return jsonify({"error": "Invalid date or start time format. Use YYYY-MM-DD and HH:MM."}), 400

            new_event = Event(
                title=data['title'],
                description=data.get('description'),
                start_time=start_dt,
                end_time=end_dt,
                notify=data.get('notify', False),
                user_id=current_user.id
            )

            db.session.add(new_event)
            db.session.commit()

            return jsonify(new_event.to_dict()), 201

        except Exception as e:
            app.logger.error(f"Error creating event for user {current_user.id}: {e}")
            db.session.rollback()
            return jsonify({"error": "An error occurred while creating the event."}), 500


@app.route('/api/dashboard', methods=['GET'])
@login_required
def dashboard():
    return jsonify({"message": f"Hello {current_user.username}, welcome!"})


@app.route('/api/weather', methods=['GET'])
@login_required
def weather():
    return api_calls.ApiCalls.get_current_weather().get('current_weather')


@app.route('/api/meme', methods=['GET'])
@login_required
def meme():
    return api_calls.ApiCalls.get_meme()


@app.route('/api/stocks', methods=['GET'])
@login_required
def currency():
    return api_calls.ApiCalls.get_currency()


@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200


@app.route('/api/news', methods=['GET'])
@login_required
def news():
    query = request.args.get('query', 'technology')
    country = request.args.get('country', 'hu')
    language = request.args.get('language', 'en')
    return api_calls.ApiCalls.get_latest_news(query=query, country=country, language=language)


@app.route('/api/flights', methods=['GET'])
@login_required
def flights():
    limit = request.args.get('limit', 10, type=int)
    return api_calls.ApiCalls.get_flights_from_budapest(limit=limit)


@app.route('/api/moon_phase', methods=['GET'])
@login_required
def moon_debrecen():
    return api_calls.ApiCalls.get_moon_data_debrecen()


@app.route('/api/popular_stocks', methods=['GET'])
@login_required
def popular_stocks():
    symbols = request.args.getlist('symbols')
    if not symbols:
        symbols = None
    return api_calls.ApiCalls.get_most_popular_stocks(symbols=symbols)


@app.route('/api/predict', methods=['POST'])
@login_required
def predict():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    MODEL_PATH = os.path.join(BASE_DIR, "pytorch_interest_predictor.pth")
    PREPROCESSOR_PATH = os.path.join(BASE_DIR, "pytorch_preprocessor.pkl")

    preprocessor = joblib.load(PREPROCESSOR_PATH)
    state_dict = torch.load(MODEL_PATH, map_location=torch.device('cpu'))

    # Determine input dimension from the saved state_dict
    if 'layer1.weight' not in state_dict:
        return jsonify({"error": "Invalid model file"}), 500
    input_dim = state_dict['layer1.weight'].shape[1]

    model = NeuralNet(input_dim)
    model.load_state_dict(state_dict)
    model.eval()

    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    df_input = pd.DataFrame([data])
    X_processed = preprocessor.transform(df_input)
    if hasattr(X_processed, 'toarray'):
        X_processed = X_processed.toarray()
    X_tensor = torch.tensor(X_processed, dtype=torch.float32)

    with torch.no_grad():
        preds = model(X_tensor).numpy()
    rounded = (preds >= 0.5).astype(int).tolist()

    return jsonify({"predictions": rounded})


@app.route('/api/recommendations', methods=['GET'])
@login_required
def get_recommendations():  # Renamed function for clarity
    if request.method == 'GET':
        try:
            # Query the database for the user's *existing* recommendation
            recommendation = AIRecommendation.query.filter_by(user_id=current_user.id).first()

            if recommendation:
                # Found an existing recommendation
                response_text = recommendation.text
            else:
                # No recommendation found, provide a default message
                response_text = "Your personalized recommendations are in the making. Check back later!"

            # The frontend JS (Home.js) expects a JSON key named "events"
            return jsonify({"events": response_text}), 200

        except Exception as e:
            app.logger.error(f"Error fetching recommendations for user {current_user.id}: {e}")
            return jsonify({"error": "An error occurred while retrieving recommendations."}), 500


def get_ai_recommendations(raw_events):
    final_response = ""
    new_line = '\n\n'

    response = client.chat(
        model="phi3:mini",
        messages=[
            {"role": "system",
                #"content": "Construct a response based on these events: " + raw_events + " create a bullet point list with two blank lines between each element that gives me new just 3 activity ideas. also elaborate on the recommended activities, also provide a reason like: based on your event history you usually attend social events at this time (Use singular second person pronoung - you). No more than 3 list elements and 7 words in a sentence. Put 2 blank lines between activity"},
            #"content": "Construct a completely new, exciting activity recommendation list STRICTLY consisting of 3 elements with reasons send it as reply and do not send anytihng else. Take this previous hisotry into consideration: " + raw_events + "each element has to contain activity name and provide a short reason like: based on your event history you usually attend social events at this time (Use singular second person pronoung - you). Keep everything it the point, short, compact, few words, format it like a bullet point list elements leave empty lines between recommendations with nothing written in them just empty lines for readability between all list elements and only return the recommendation NOTHING about empty spaces, restrictions. MAKE sure it does not contain anything like DO NOT INCLUDE THE RESTRICTIONS IN THE OUTPUT "}
             "content": "You are a recommendation assistant. Your task is to provide 3 activity recommendations based on user history. You MUST follow these rules:\n"
                        "1. Provide EXACTLY 3 recommendations.\n"
                        "2. Each recommendation must be a single bullet point.\n"
                        "3. Each recommendation must have a title, a short description (max 7 words), and a brief reason.\n"
                        "4. You MUST end each recommendation with 'NN'.\n"
                        "5. You MUST not mention specific locations, just general ideas.\n"
                        "6. Do not write anything else. No introduction, no conclusion.\n\n"
                        "User History: " + raw_events + "\n\n"
                                                        "Example Output:\n"
                                                        " Go Hiking: Explore a new trail. You often enjoy nature activities. 'NN'"
                                                        " Visit a Museum: See the new art exhibit. You attended a gallery last month. 'NN'"
                                                        " Try a Cooking Class: Learn a new recipe. You seem to enjoy food-related events. 'NN'"}
            # {"role": "user", "content": raw_events}
        ]
    )

    #final_response = final_response + '\n ' + '\n' + response['message']['content']

    return response['message']['content'].replace("NN",new_line)


def update_all_recommendations():
    with app.app_context():
        print('Updating all recommendations')
        users = User.query.all()

        for user in users:

            user_events = '\n'.join(
                f"Title: {e.title} | Description: {e.description or '—'} | "
                f"Notify: {e.notify} | Start: {e.start_time.strftime('%Y-%m-%d %H:%M')} | "
                f"End: {e.end_time.strftime('%Y-%m-%d %H:%M') if e.end_time else '—'}"
                for e in user.events
            )

            new_rec = get_ai_recommendations(user_events)

            rec = AIRecommendation.query.filter_by(user_id=user.id).first()

            if rec:
                rec.text = new_rec  # update existing record
                print(f"Updated recommendation for {user.username}")
            else:
                rec = AIRecommendation(user_id=user.id, text=new_rec)
                db.session.add(rec)
                print(f"Created recommendation for {user.username}")
            db.session.commit()

        db.session.commit()
        print("✅ All user recommendations updated.")


@app.route('/api/home_data', methods=['GET'])
@login_required
def home_data():
    print('Constructing api call responses needed for the homepage')
    # 1. Get the user's settings (or use defaults)
    user = current_user
    user_settings_obj = getattr(user, 'settings', None)
    settings = user_settings_obj.settings if user_settings_obj else {}

    api_results = []

    # 2. Check each setting and call the corresponding API
    # The 'key' (e.g., "weather") MUST match the 'case' in your frontend JavaScript

    # --- Example: Weather ---
    # NOTE: Adjust 'weather_enabled' to match the key you save in your user settings
    if settings.get('weather_enabled', True):

        api_results.append( cached_api_results['weather'])


    # --- Example: Currency ---
    if settings.get('currency_enabled', True):
        api_results.append(cached_api_results['currency'])

    # --- Example: Meme ---
    if settings.get('meme_enabled', True):
        api_results.append(cached_api_results['meme'])


    if settings.get('stock_enabled', True):
        api_results.append(cached_api_results['stock'])


    # --- Example: News ---
    if settings.get('news_enabled', True):
        api_results.append(cached_api_results['news'])


    # --- Example: Moon Phase ---
    if settings.get('moon_enabled', True):
        api_results.append(cached_api_results['moon'])

    if settings.get('flight_enabled', True):
        api_results.append(cached_api_results['flight'])

    print('returned all api data')
    return jsonify({"apis": api_results})


def cache_api_responses():
    print('Caching all api responses')
    try:
        weather_data = api_calls.ApiCalls.get_current_weather()
        cached_api_results['weather'] = {"key": "weather", "title": "Current Weather", "data": weather_data}
    except Exception as e:
        app.logger.error(f"Failed to fetch weather: {e}")
        cached_api_results['weather'] = {"key": "weather", "title": "Current Weather", "data": {"error": str(e)}}

    # --- Example: Currency ---
    if True:
        try:
            currency_data = api_calls.ApiCalls.get_currency()
            cached_api_results['currency'] = {"key": "currency", "title": "Currency (USD to HUF)", "data": currency_data}
        except Exception as e:
            app.logger.error(f"Failed to fetch currency: {e}")
            cached_api_results['currency'] = {"key": "currency", "title": "Currency (USD to HUF)", "data": {"error": str(e)}}

    # --- Example: Meme ---
    if True:
        try:
            meme_data = api_calls.ApiCalls.get_meme()
            cached_api_results['meme'] = {"key": "meme", "title": "Daily Meme", "data": meme_data}
        except Exception as e:
            app.logger.error(f"Failed to fetch meme: {e}")
            cached_api_results['meme'] = {"key": "meme", "title": "Daily Meme", "data": {"error": str(e)}}

    # --- Example: Stock ---
    if True:
        try:
            # Using your popular_stocks function for this
            stock_data = api_calls.ApiCalls.get_most_popular_stocks(symbols=['AAPL', 'MSFT', 'GOOGL'])
            cached_api_results['stock'] = {"key": "stock", "title": "Popular Stocks", "data": stock_data}
        except Exception as e:
            app.logger.error(f"Failed to fetch stock: {e}")
            cached_api_results['stock'] = {"key": "stock", "title": "Popular Stocks", "data": {"error": str(e)}}

    # --- Example: News ---
    if True:
        try:
            news_data = api_calls.ApiCalls.get_latest_news(query='technology', country='hu', language='en')
            cached_api_results['news'] = {"key": "news", "title": "Tech News", "data": news_data}
        except Exception as e:
            app.logger.error(f"Failed to fetch news: {e}")
            cached_api_results['news'] = {"key": "news", "title": "Tech News", "data": {"error": str(e)}}

    # --- Example: Moon Phase ---
    if True:
        try:
            moon_data = api_calls.ApiCalls.get_moon_data_debrecen()
            cached_api_results['moon'] = {"key": "moon", "title": "Moon Phase", "data": moon_data}
        except Exception as e:
            app.logger.error(f"Failed to fetch moon: {e}")
            cached_api_results['moon'] = {"key": "moon", "title": "Moon Phase", "data": {"error": str(e)}}

    # --- Example: Flight Data ---
    if True:
        try:
            flight_data = api_calls.ApiCalls.get_flights_from_budapest(limit=5)
            cached_api_results['flight'] = {"key": "flight", "title": "Flights from BUD", "data": flight_data}
        except Exception as e:
            app.logger.error(f"Failed to fetch flight: {e}")
            cached_api_results['flight'] = {"key": "flight", "title": "Flights from BUD", "data": {"error": str(e)}}

    print('Cached all api data')


def run_scheduler():
    schedule.every(30).minutes.do(update_all_recommendations)

    # Optional: run task immediately on startup
    update_all_recommendations()

    while True:
        schedule.run_pending()
        time.sleep(100)  # check every 10 seconds


from flask import request, jsonify, abort
from flask_login import login_required, current_user
from Models import db, Post, User  # Make sure to import Post and User


# Note: These routes assume you have added:
# likes = db.Column(db.Integer, nullable=False, default=0)
# to your Post model in Models.py

# --- CREATE and READ Posts ---
@app.route('/api/posts', methods=['GET', 'POST'])
@login_required
def handle_posts():
    """
    Handles creating a new post (POST) or getting all posts (GET).
    """
    if request.method == 'POST':
        data = request.get_json()
        text = data.get('text')

        if not text:
            return jsonify({'error': 'Post text is required.'}), 400

        # Create new post
        try:
            post = Post(user_id=current_user.id, text=text, likes=0)
            db.session.add(post)
            db.session.commit()

            # Return the full post object using the to_dict method
            return jsonify(post.to_dict()), 201

        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Error creating post: {e}")
            return jsonify({'error': 'Failed to create post.'}), 500

    elif request.method == 'GET':
        """
        Gets the latest posts.
        Updated to use the model's to_dict() method.
        """
        try:
            # Get latest 10 posts, newest first
            latest_posts = Post.query.order_by(Post.id.desc()).limit(10).all()

            # Use to_dict() to serialize each post
            # This assumes your Post.to_dict() returns username and likes
            result = [post.to_dict() for post in latest_posts]

            return jsonify(result), 200

        except Exception as e:
            app.logger.error(f"Error fetching posts: {e}")
            return jsonify({'error': 'Failed to fetch posts.'}), 500


# --- UPDATE (Like) a Post ---
@app.route('/api/posts/<int:post_id>/like', methods=['POST'])
@login_required
def like_post(post_id):
    """
    Increments the like count for a specific post.
    """
    try:
        post = db.session.get(Post, post_id)

        if not post:
            return jsonify({'error': 'Post not found.'}), 404

        # Increment the likes
        if post.likes is None:
            post.likes = 0
        post.likes += 1

        db.session.commit()

        # Return the updated post object
        return jsonify(post.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error liking post {post_id}: {e}")
        return jsonify({'error': 'Failed to like post.'}), 500


# --- UPDATE (Edit Text) of a Post ---
@app.route('/api/posts/<int:post_id>', methods=['PUT'])
@login_required
def update_post(post_id):
    """
    Updates the text of a specific post.
    Only the author of the post can update it.
    """
    try:
        post = db.session.get(Post, post_id)

        if not post:
            return jsonify({'error': 'Post not found.'}), 404

        # Check authorization
        if post.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized to edit this post.'}), 403

        data = request.get_json()
        text = data.get('text')

        if not text:
            return jsonify({'error': 'Post text cannot be empty.'}), 400

        # Update the text
        post.text = text
        db.session.commit()

        return jsonify(post.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error updating post {post_id}: {e}")
        return jsonify({'error': 'Failed to update post.'}), 500


# --- DELETE a Post ---
@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
@login_required
def delete_post(post_id):
    """
    Deletes a specific post.
    Only the author of the post can delete it.
    """
    try:
        post = db.session.get(Post, post_id)

        if not post:
            return jsonify({'error': 'Post not found.'}), 404

        # Check authorization
        if post.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized to delete this post.'}), 403

        # Delete the post
        db.session.delete(post)
        db.session.commit()

        return jsonify({'message': 'Post deleted successfully.'}), 200

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error deleting post {post_id}: {e}")
        return jsonify({'error': 'Failed to delete post.'}), 500


# --- NEW ---
# API route to get a user's profile info and all their posts
@app.route('/api/users/<username>', methods=['GET'])
@login_required
def get_user_profile(username):
    # Find the user by username
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Get all posts for that user, newest first
    posts = Post.query.filter_by(user_id=user.id).order_by(Post.id.desc()).all()

    # --- MODIFICATION: Get user settings for interests ---
    enabled_apis = []
    # Check if the user has settings and if that settings object has the json blob
    if user.settings and user.settings.settings:
        # Get the 'enabledApis' list, default to empty list if not found
        enabled_apis = user.settings.settings.get('enabledApis', [])
    # --- END MODIFICATION ---

    # Serialize the data
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "enabledApis": enabled_apis  # <-- MODIFIED: Add interests list to response
    }
    # Use the existing to_dict() method for consistency
    posts_data = [post.to_dict() for post in posts]

    return jsonify({"user": user_data, "posts": posts_data}), 200


if __name__ == "__main__":
    try:
        with open(CREDENTIALS_FILE) as file:
            dbstring = file.readline().strip()
            if not dbstring:
                raise ValueError("Credentials file is empty.")
            app.config['SQLALCHEMY_DATABASE_URI'] = dbstring
            app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
            db.init_app(app)
            print("Database initialized successfully.")

    except FileNotFoundError:
        print(f"CRITICAL ERROR: {CREDENTIALS_FILE} not found. Database will not connect.")
    except ValueError as e:
        print(f"CRITICAL ERROR: {e}")
    except Exception as e:
        print(f"CRITICAL DATABASE ERROR: {e}")

    with app.app_context():
        try:
            db.create_all()
            print("Database tables checked/created.")
        except Exception as e:
            print(f"Error creating database tables: {e}")
        cache_api_responses()
        scheduler_thread = threading.Thread(target=run_scheduler)
        scheduler_thread.daemon = True
        scheduler_thread.start()
    app.run(host='0.0.0.0', port=5000, debug=True)
