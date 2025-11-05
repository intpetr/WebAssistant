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

/* Handling delete operations */
async function deleteEvent() {
  if (!currentEventId) return;

  const originalText = deleteButton.textContent;
  setButtonState(deleteButton, true, originalText);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/calendar/${currentEventId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (response.ok) {
      showMessage("Event successfully deleted!", "success");
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
      showMessage(errorResult.error || "Failed to delete event.", "error");
    }
  } catch (error) {
    console.error("API Delete Error: ", error);
    showMessage("Network error during deletion.", "error");
  } finally {
    setButtonState(deleteButton, false, originalText);
  }
}

/* --FullCalendar Integration-- */
async function fetchEvents(fetchInfo, successCallback, failureCallback) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/calendar?start=${fetchInfo.startStr}&end=${fetchInfo.endStr}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        showMessage(
          "Session expired or unauthorized. Please log in again",
          "error"
        );
        setTimeout(() => {
          window.location.href = "../Login/Login.html";
        }, 5000);
      }
      const errorResult = await response.json();
      console.error("Failed to fetch events: ", errorResult.error);
      showMessage("Failed to lead events.", "error");
      failureCallback(new Error(errorResult.error));
      return;
    }

    const data = await response.json();

    // Map your backend event object structure to FullCalendar's required structure
    const fullCalendarEvents = (data.events || []).map((e) => ({
      id: e.id,
      title: e.title,
      start: `${e.date}T${e.startTime}`,
      end: `${e.date}T${e.endTime}`,
      extendedProps: {
        description: e.description,
        notify: e.notify,
        date: e.date,
        startTime: e.startTime,
        endTime: e.endTime,
      },
      backgroundColor: "hsl(170, 100%, 25%)",
      borderColor: "hsl(170, 100%, 15%)",
    }));

    successCallback(fullCalendarEvents);
  } catch (error) {
    console.error("Network error during event fetch:", error);
    failureCallback(error);
  }
}

/* Handling event time/date updates */
async function handleEventChange(info) {
  const event = info.event;

  // 1. Reformat the new start and end times
  const newDate = event.start.toISOString().substring(0, 10);
  const newStartTime = event.start.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  let newEndTime = newStartTime;
  if (event.end) {
    newEndTime = event.end.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // 2. Build the payload for the backend
  const payload = {
    id: event.id,
    title: event.title,
    date: newDate,
    startTime: newStartTime,
    endTime: newEndTime,
    description: event.extendedProps.description,
    notify: event.extendedProps.notify,
  };

  // 3. Send the API request (PUT) - Use the new /api/calendar endpoint
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar/${event.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      showMessage("Event time updated successfully!", "success");
    } else if (response.status === 401) {
      // Check for 401 Unauthorized
      info.revert(); // Revert calendar change visually
      showMessage(
        "Session expired or unauthorized. Please log in again.",
        "error"
      );
      setTimeout(() => {
        window.location.href = "/Login/"; // Redirect as per Settings.js
      }, 1000);
    } else {
      info.revert();
      const errorResult = await response.json();
      showMessage(
        errorResult.error || "Failed to update event time. Reverting change.",
        "error"
      );
    }
  } catch (error) {
    console.error("API Drag/Resize Error:", error);
    info.revert();
    showMessage(
      "Network error: Could not update event time. Reverting change.",
      "error"
    );
  }
}
