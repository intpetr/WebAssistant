from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.sql import func
db = SQLAlchemy()


class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    password = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(50))  # ← new column added here

    events = db.relationship(
        'Event',
        back_populates='user',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )

    notes = db.relationship(
        'Note',
        back_populates='user',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )

    posts = db.relationship(
        'Post',
        back_populates='user',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )

    ai_recommendations = db.relationship(
        'AIRecommendation',
        back_populates='user',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )

    @staticmethod
    def get_by_username(username):
        return User.query.filter_by(username=username).first()


class UserSettings(db.Model):
    __tablename__ = 'user_settings'
    __table_args__ = {'schema': 'public'}

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    settings = db.Column(JSON)

    user = db.relationship(
        'User',
        backref=db.backref('settings', uselist=False)
    )


class Event(db.Model):
    __tablename__ = 'events'

    event_id = db.Column(db.Integer, primary_key=True)

    # These are required by your JS form
    title = db.Column(db.String(255), nullable=False)
    start_time = db.Column(db.DateTime(timezone=True), nullable=False)

    # These are optional
    description = db.Column(db.Text, nullable=True)
    notify = db.Column(db.Boolean, nullable=False, default=False)
    end_time = db.Column(db.DateTime(timezone=True), nullable=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False
    )

    user = db.relationship('User', back_populates='events')

    def to_dict(self):
        """
        Converts the event object to a serializable dictionary
        matching the JavaScript frontend's expectations.
        """

        # Split start_time into date and time
        event_date = self.start_time.strftime('%Y-%m-%d')
        start_time_str = self.start_time.strftime('%H:%M')

        # Split end_time, but only if it exists
        end_time_str = None
        if self.end_time:
            end_time_str = self.end_time.strftime('%H:%M')

        return {
            'id': self.event_id,  # JS expects 'id', not 'event_id'
            'title': self.title,
            'description': self.description,
            'notify': self.notify,
            'date': event_date,  # JS expects 'date'
            'startTime': start_time_str,  # JS expects 'startTime'
            'endTime': end_time_str  # JS expects 'endTime'
        }

    def __repr__(self):
        return f'<Event {self.event_id}: {self.title}>'


class Note(db.Model):
    __tablename__ = 'notes'

    note_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=True)
    content = db.Column(db.Text, nullable=False)

    # This timestamp will automatically update on creation and on update
    timestamp = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False
    )

    user = db.relationship('User', back_populates='notes')

    def to_dict(self):
        """
        Converts the note object to a serializable dictionary
        matching the JavaScript frontend's expectations.
        """
        return {
            'id': self.note_id,
            'title': self.title,
            'content': self.content,
            'timestamp': self.timestamp.isoformat()  # JS 'new Date()' can parse ISO format
        }

    def __repr__(self):
        return f'<Note {self.note_id}: {self.title}>'

class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)

    likes = db.Column(db.Integer, nullable=False, default=0)
    # Foreign key to users.id
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False
    )

    # Relationship back to the User
    user = db.relationship('User', back_populates='posts')

    def to_dict(self):
        """Return a serializable representation of a post."""
        return {
            'id': self.id,
            'text': self.text,
            'user_id': self.user_id,
            'username': self.user.username,  # <-- MODIFIED: Added this line
            'likes': self.likes               # <-- MODIFIED: Added this line
        }

    def __repr__(self):
        return f'<Post {self.id}: {self.text[:20]}>'  # Show first 20 chars


class AIRecommendation(db.Model):
    __tablename__ = 'ai_recommendations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False
    )
    text = db.Column(db.Text, nullable=False)

    # Relationship back to the User
    user = db.relationship('User', back_populates='ai_recommendations')

    def __repr__(self):
        return f'<AIRecommendation {self.id}: {self.text[:30]}>'