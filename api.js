// Paste your latest Apps Script /exec URL here:
const API_URL = "https://script.google.com/macros/s/AKfycbyHYD32ErIjfodsi94cFSuYyIDBviRtEmCA1dXdItvLOIj-gGzsIpAp7Cm32avxmEha/exec";

function showLoading(v) {
  document.getElementById("loadingMsg").style.display = v ? "block" : "none";
}

// All calls are GET requests with query params — this avoids the
// CORS/POST issue Apps Script has when called from another origin.
async function apiCall(action, payload = {}) {
  showLoading(true);
  try {
    const params = new URLSearchParams({ action, ...payload });
    const res = await fetch(`${API_URL}?${params.toString()}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  } finally {
    showLoading(false);
  }
}

async function apiGet(action, payload = {}) {
  return apiCall(action, payload);
}

async function apiPost(action, payload = {}) {
  return apiCall(action, payload);
}