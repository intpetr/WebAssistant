/* API Configuration */
import api from "../api";
const NOTES_ENDPOINT = `${api}/api/notes`;

/* DOM Element References */
const noteForm = document.getElementById("note-form");
const notesList = document.getElementById("notes-list");
const searchInput = document.getElementById("search-input");
const newNoteToggleBtn = document.getElementById("new-note-toggle-btn");
const saveNoteBtn = document.getElementById("save-note-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const noteIdInput = document.getElementById("note-id");
const noteTitleInput = document.getElementById("note-title");
const noteContentInput = document.getElementById("note-content");
const messageBox = document.getElementById("message-box");
const messageText = document.getElementById("message-text");
