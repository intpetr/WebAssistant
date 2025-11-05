import api from "../api";

const API_BASE_URL = api;
let calendar;
let currentEventId = null;

/* DOM Elements */
const calendarE1 = document.getElementById("full-calendar");
const model = document.getElementById("event-model");
const modelTitle = document.getElementById("model-title");
const eventForm = document.getElementById("event-form");
const deleteButton = document.getElementById("delete-event-btn");
const cancelButton = document.getElementById("cancel-event-btn");
const messageBox = document.getElementById("message-box");
const messageText = document.getElementById("message-text");

/* Form inputs */
const titleInput = document.getElementById("event-title");
const dateInput = document.getElementById("event-date");
const startTimeInput = document.getElementById("event-start-time");
const endTimeInput = document.getElementById("event-end-time");
const descriptionInput = document.getElementById("event-description");
const notifyCheckbox = document.getElementById("event-notify");

/* --Utility functions consistent with other files-- */
/* Status message */
function showMessage(message, type = "error") {
  messageBox.classList.remove("message-success", "message-error ", "hidden");

  if (type === "success") {
    messageBox.classList.add("message-success");
  } else {
    messageBox.classList.add("message-error");
  }

  messageText.textContent = message;

  /* Auto hiding message after 5 seconds */
  setTimeout(() => {
    messageBox.classList.add("hidden");
    messageBox.textContent = "";
  }, 5000);
}

/* Setting the loading state of a button */
function setButtonLoadingState(button, isLoading, originalText) {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `<span class="loading-spinner"></span> Saving...`;
  } else {
    button.disabled = false;
    button.innerHTML = originalText;
  }
}

/* --Model and Form handlers-- */
/* Opening the model, resetting the form and setting the context */
function openModel(eventData = null, initialDate = null) {
  eventForm.reset();
  currentEventId = null;
  deleteButton.classList.add("hidden");

  if (eventData) {
    /* Edit Mode */
    modelTitle.textContent = "Edit Event";
    currentEventId = eventData.id;

    /* Populating form fields */
    titleInput.value = eventData.title || "";
    dateInput.value = eventData.date || "";
    startTimeInput.value = eventData.startTime || "08:00";
    endTimeInput.value = eventData.endTime || "09:00";
    descriptionInput.value = eventData.description || "";
    notifyCheckbox.checked = eventData.notify || false;

    deleteButton.classList.remove("hidden");
  } else {
    /* Create Mode */
    modelTitle.textContent = "Create New Event";
    if (initialDate) {
      dateInput.value = initialDate;
    } else {
      dateInput.value = new Date().toISOString().substring(0, 10);
    }
  }

  model.classList.remove("hidden");
}

/* Closing the model and resetting the context */
function closeModel() {
  model.classList.add("hidden");
  currentEventId = null;
  eventForm.reset();
}
