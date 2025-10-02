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

