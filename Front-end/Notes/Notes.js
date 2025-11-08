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

/* --Rendering and Search Logic-- */
/* Rendering the list of notes into the DOM */
function renderNotes(notesToRender) {
        notesList.innerHTML = "";

        if (notesToRender.length === 0) {
                notesList.innerHTML =
                        '<p class="initial-message">No notes found. Click "Add New Note" to get started <p/>';
                return;
        }

        notesToRender.forEach((note) => {
                const noteElement = document.createElement("div");
                noteElement.className = "note-card";
                noteElement.setAttribute("data-id", note.id);

                const date = new Date(note.timestamp);
                const formattedDate =
                        date.toLocaleDateString() +
                        " " +
                        date.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                        });

                noteElement.innerHTML = `
                        <h3 class="note-title">${
                                note.title || "Untitled Note"
                        }</h3>
                        <p class="note-timestamp">Last updated: ${formattedDate}</p>
                        <p class="note-content">${note.content.substring(
                                0,
                                200
                        )}${note.content.length > 200 ? "..." : ""}</p>
                        <div class="note-actions">
                                <button class="edit-btn secondary-button" data-id="${
                                        note.id
                                }">
                                <i class="fa-solid fa-pen"></i> Edit
                                </button>
                                <button class="delete-btn delete-button" data-id="${
                                        note.id
                                }">
                                <i class="fa-solid fa-trash"></i> Delete
                                </button>
                        </div>
                `;
                notesList.appendChild(noteElement);
        });
}

/* Filtering the globally stored notes based on the search input value */
function filterNotes() {
        const query = searchInput.value.toLoweCase();

        const filteredNotes = allNotes.filter((note) => {
                const title = (note.title || "").toLoweCase();
                const content = (note.content || "").toLoweCase();
                return title.includes(query) || content.includes(query);
        });

        renderNotes(filterNotes);
}
