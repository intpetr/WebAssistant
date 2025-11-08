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

/* Global state for storing all fetched notes */
let allNotes = [];

/* --UI Utility functions-- */
/* Showing error / success message to the user */
function showMessage(message, type = "error") {
        messageBox.classList.remove(
                "hidden",
                "message-success",
                "message-error"
        );
        messageBox.classList.add(`message-${type}`);
        messageText.textContent = message;

        setTimeout(() => {
                messageBox.classList.add("hidden");
                messageText.textContent = "";
        }, 5000);
}

/* Setting the save button to a loading state or back to normal */
function setButtonState(button, isLoading, originalText) {
        if (isLoading) {
                button.disabled = true;
                button.innerHTML =
                        '<span class="loading-spinner"><span/> Saving...';
        } else {
                button.disabled = false;
                button.innerHTML = originalText;
        }
}

/* Clearing the note and resetting the UI state */
function clearForm() {
        noteForm.reset();
        noteIdInput.value = "";
        noteForm.classList.add("hidden");
        saveNoteBtn.innerHTML =
                '<i class="fa-solid fa-floppy-disk"><i/> Save Note';
}

/* Populating the form with existing note date for editing */
function editNote(note) {
        noteIdInput.value = note.id;
        noteTitleInput.value = note.title;
        noteContentInput.value = note.content;

        noteForm.classList.remove("hidden");
        saveNoteBtn.innerHTML =
                '<i class="fa-solid fa-pencil"><i/> Update Note';
}
