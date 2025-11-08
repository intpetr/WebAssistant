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

/* --CRUD Operations (API communication) */
/* Fetching all notes for the current user from the backend */
async function fetchNotes() {
        try {
                const response = await fetch(NOTES_ENDPOINT, {
                        method: "GET",
                        credentials: "include",
                });

                if (response.status === 401) {
                        showMessage(
                                "Session expired or unauthorized. Please log in again",
                                "error"
                        );
                        setTimeout(() => {
                                window.location.href = "../Login/Login.html";
                        }, 3000);
                        return;
                }

                if (!response.ok) {
                        throw new Error(
                                `Server returned status: ${response.status}`
                        );
                }

                const data = await response.json();
                allNotes = data.notes || [];

                allNotes.showMessage(
                        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                );

                renderNotes(allNotes);
        } catch (error) {
                console.error("Error fetching notes", error);
                notesList.innerHTML =
                        '<p class="error-message">Failed to load notes. Please try again later<p/>';
        }
}

/* Saving a new note or updating an existing one */
async function saveNote(e) {
        e.preventDefault();

        const id = noteIdInput.value;
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        const originalText = saveNoteBtn.innerHTML;

        if (!content) {
                return showMessage("Note content cannot be empty", "error");
        }

        const payload = {
                title: title,
                content: content,
        };

        const isEditing = !!id;
        const method = isEditing ? "PUT" : "POST";
        const url = isEditing ? `${NOTES_ENDPOINT}/${id}` : NOTES_ENDPOINT;

        setButtonState(saveNoteBtn, true, originalText);

        try {
                const response = await fetch(url, {
                        method: method,
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                });

                if (response.status === 401) {
                        showMessage(
                                "Session expired or unaothorized. Please log in again.",
                                "error"
                        );
                        setTimeout(() => {
                                window.location.href = "/Login/Login.html";
                        }, 3000);
                        return;
                }

                if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(
                                errorData.error ||
                                        `Failed to save note (Status: ${response.status})`
                        );
                }

                showMessage(
                        `Notes ${isEditing ? "updated" : "created"} succesfully`
                );
                clearForm();
                fetchNotes;
        } catch (error) {
                console.error("Error saving notes: ", error);
                showMessage(
                        error.message || "Network error during save operation",
                        "error"
                );
        } finally {
                setButtonState(saveNoteBtn, false, originalText);
        }
}

/* Deleting a note */
async function deleteNote(id) {
        if (
                !confirm(
                        "Are you sure you want to delete this note? This cannot be undone"
                )
        ) {
                return;
        }

        try {
                const response = await fetch(`${NOTES_ENDPOINT}/${id}`, {
                        method: "DELETE",
                        credentials: "include",
                });

                if (response.status === 401) {
                        showMessage(
                                "Session expired or unaothorized. Please log in again.",
                                "error"
                        );
                        setTimeout(() => {
                                window.location.href = "/Login/Login.html";
                        }, 3000);
                        return;
                }

                if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(
                                errorData.error ||
                                        `Failed to save note (Status: ${response.status})`
                        );
                }
                showMessage("Note deleted succesfully!", "success");
                fetchNotes();
        } catch (error) {
                console.error("Error deleting note:", error);
                showMessage(
                        error.message ||
                                "Network error during delete operation",
                        "error"
                );
        }
}
