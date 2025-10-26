from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from sqlalchemy.dialects.postgresql import JSON

db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    password = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(50))  # ← new column added here

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
