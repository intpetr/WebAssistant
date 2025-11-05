import api from "../api";

const API_BASE_URL = api;
let calendar;
let currentEventId = null;

/* DOM Elements */
const calendarE1 = document.getElementById("full-calendar");
const model = document.getElementById("event-model");
const modelTitle = document.getElementById("model-title");
const eventForm = document.getElementById("event-form");
const saveButton = document.getElementById("save-event-btn");
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
function setButtonState(button, isLoading, originalText) {
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

/* --Backend API Communication */
/* Converitng the form data into JSON payload for backend */
function getEventPayload() {
  return {
    id: currentEventId,
    title: titleInput.value,
    date: dateInput.value,
    startTime: startTimeInput.value,
    endTime: endTimeInput.value,
    description: descriptionInput.value,
    notify: notifyCheckbox.checked,
  };
}

/* Handling Create and Update operations */
async function saveEvent(e) {
  e.preventDefault();

  const payload = getEventPayload();

  if (!payload.title || payload.date || payload.startTime) {
    return showMessage("Title, Date and Start Time are required", "error");
  }

  const isNew = !currentEventId;
  const method = isNew ? "POST" : "PUT";
  const endPoint = isNew ? "/api/calendar" : `/api/calendar/${currentEventId}`;
  const originalText = saveButton.textContent;
  setButtonState(saveButton, true, originalText);

  try {
    const response = await fetch(API_BASE_URL + endPoint, {
      method: method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      showMessage(
        `Event successfully ${isNew ? "created" : "updated"}!`,
        "success"
      );
      closeModel();
      calendar.refetchEvents();
    } else if (response.status === 401) {
      showMessage(
        "Session expired or unauthorized. Please log in again",
        "error"
      );
      setTimeout(() => {
        window.location.href = "../Login/Login.html";
      }, 5000);
    } else {
      const errorResult = await response.json();
      showMessage(
        errorResult.error || `Failed to ${isNew ? "create" : "update"} event`,
        "error"
      );
    }
  } catch (error) {
    console.error("API Save Error: ", error);
    showMessage("Network error: Could not connect to the server.", "error");
  } finally {
    setButtonState(saveButton, false, originalText);
  }
}
