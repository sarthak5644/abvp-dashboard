let dashboardData = {};
let membershipData = [];
let currentUser = null;

/* ---------------- LOGIN ---------------- */

function initLogin() {
  let saved = null;
  try { saved = localStorage.getItem("abvp_user"); } catch (e) {}

  if (saved) {
    currentUser = JSON.parse(saved);
    document.getElementById("loginOverlay").style.display = "none";
    document.getElementById("currentUserLabel").innerText =
      currentUser.name + " (" + currentUser.email + ")";
    document.getElementById("currentUserRole").innerText = currentUser.role || "User";
    loadDashboard();
  } else {
    document.getElementById("loginOverlay").style.display = "flex";
  }

  renderOccasionBanner();
}

async function doLogin() {
  const name = document.getElementById("loginName").value.trim();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const errorBox = document.getElementById("loginError");
  errorBox.innerText = "";

  if (!name || !email) {
    errorBox.innerText = "Please enter both name and email.";
    return;
  }

  try {
    const res = await apiGet("checkAccess", { email });

    if (!res.allowed) {
      errorBox.innerText = res.message || "You are not authorised to access this dashboard.";
      return;
    }

    currentUser = {
      name: res.user.Name || name,
      email: res.user.Email || email,
      role: res.user.Role || "User",
      prant: res.user.Prant || ""
    };

    localStorage.setItem("abvp_user", JSON.stringify(currentUser));

    document.getElementById("loginOverlay").style.display = "none";
    document.getElementById("currentUserLabel").innerText =
      currentUser.name + " (" + currentUser.email + ")";
    document.getElementById("currentUserRole").innerText = currentUser.role;

    loadDashboard();

  } catch (err) {
    errorBox.innerText = "Login failed: " + err.message;
  }
}

function logout() {
  try { localStorage.removeItem("abvp_user"); } catch (e) {}
  currentUser = null;
  document.getElementById("loginName").value = "";
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginError").innerText = "";
  document.getElementById("loginOverlay").style.display = "flex";
}

function getAddedByLabel() {
  return currentUser ? (currentUser.name + " (" + currentUser.email + ")") : "Unknown";
}

/* ---------------- NAVIGATION ---------------- */

function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".nav").forEach(a => a.classList.remove("active-link"));
  document.getElementById("navlink-" + id).classList.add("active-link");
}

/* ---------------- LOAD DASHBOARD ---------------- */

async function loadDashboard() {
  try {
    const stats = await apiGet("getDashboardStats");

    dashboardData = stats;
    membershipData = stats.latestRecords || [];

    document.getElementById("totalMembership").innerText = stats.totalMembership || 0;
    document.getElementById("totalPrants").innerText = stats.totalPrants || 5;
    document.getElementById("activeFormsCount").innerText = stats.activeForms ? stats.activeForms.length : 0;
    document.getElementById("pravasCount").innerText = stats.pravas ? stats.pravas.length : 0;

    renderPrantTable(stats.prantCount || {});
    renderMembershipTable(membershipData);
    renderPravas(stats.pravas || []);
    renderForms(stats.activeForms || []);
    renderLogs(stats.logs || []);

  } catch (err) {
    alert("Failed to load dashboard: " + err.message);
    console.error(err);
  }
}

/* ---------------- RENDER ---------------- */

function esc(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function renderPrantTable(data) {
  let html = "";
  Object.keys(data).forEach(p => {
    html += `<tr><td>${esc(p)}</td><td>${esc(data[p])}</td></tr>`;
  });
  document.getElementById("prantTable").innerHTML = html;
}

function renderMembershipTable(data) {
  const head = document.getElementById("membershipHead");
  const body = document.getElementById("membershipBody");
  head.innerHTML = ""; body.innerHTML = "";
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  headers.forEach(h => head.innerHTML += `<th>${esc(h)}</th>`);

  data.forEach(row => {
    let tr = "<tr>";
    headers.forEach(h => tr += `<td>${esc(row[h])}</td>`);
    tr += "</tr>";
    body.innerHTML += tr;
  });
}

function searchTable() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const filtered = membershipData.filter(row =>
    Object.values(row).join(" ").toLowerCase().includes(keyword)
  );
  renderMembershipTable(filtered);
}

function renderPravas(data) {
  let html = "";
  data.forEach(r => {
    html += `<tr>
      <td>${esc(r.Date)}</td><td>${esc(r["Person Name"])}</td><td>${esc(r["From Place"])}</td>
      <td>${esc(r["To Place"])}</td><td>${esc(r.Prant)}</td><td>${esc(r.District)}</td>
      <td>${esc(r.Purpose)}</td><td>${esc(r.Status)}</td><td>${esc(r["Added By"])}</td>
    </tr>`;
  });
  document.getElementById("pravasTable").innerHTML = html;
}

function renderForms(data) {
  let html = "";
  data.forEach(r => {
    const link = r["Form Link"] || "#";
    html += `<tr>
      <td>${esc(r["Form Name"])}</td><td>${esc(r.Prant)}</td><td>${esc(r.District)}</td>
      <td>${esc(r["Event Date"])}</td><td><a href="${esc(link)}" target="_blank">Open Form</a></td>
      <td>${esc(r.Status)}</td><td>${esc(r["Added By"])}</td>
    </tr>`;
  });
  document.getElementById("formsTable").innerHTML = html;
}

function renderLogs(data) {
  let html = "";
  data.forEach(r => {
    html += `<tr><td>${esc(r.Timestamp)}</td><td>${esc(r.Action)}</td><td>${esc(r.User)}</td><td>${esc(r.Details)}</td></tr>`;
  });
  document.getElementById("logsTable").innerHTML = html;
}

/* ---------------- SAVE ACTIONS ---------------- */

async function savePravas() {
  if (!currentUser) { alert("Please login first."); return; }

  const data = {
    date: document.getElementById("pDate").value,
    personName: document.getElementById("pName").value,
    fromPlace: document.getElementById("pFrom").value,
    toPlace: document.getElementById("pTo").value,
    prant: document.getElementById("pPrant").value,
    district: document.getElementById("pDistrict").value,
    purpose: document.getElementById("pPurpose").value,
    contact: document.getElementById("pContact").value,
    status: document.getElementById("pStatus").value,
    addedBy: getAddedByLabel()
  };

  try {
    const res = await apiPost("addPravas", data);
    alert(res.message || "Pravas added successfully");
    ["pDate","pName","pFrom","pTo","pDistrict","pPurpose","pContact"]
      .forEach(id => document.getElementById(id).value = "");
    loadDashboard();
  } catch (err) {
    alert("ERROR: " + err.message);
  }
}

async function saveActiveForm() {
  if (!currentUser) { alert("Please login first."); return; }

  const data = {
    formName: document.getElementById("fName").value,
    prant: document.getElementById("fPrant").value,
    district: document.getElementById("fDistrict").value,
    eventDate: document.getElementById("fDate").value,
    formLink: document.getElementById("fLink").value,
    status: document.getElementById("fStatus").value,
    addedBy: getAddedByLabel()
  };

  try {
    const res = await apiPost("addActiveForm", data);
    alert(res.message || "Form added successfully");
    ["fName","fDistrict","fDate","fLink"].forEach(id => document.getElementById(id).value = "");
    loadDashboard();
  } catch (err) {
    alert("ERROR: " + err.message);
  }
}

async function saveMembership() {
  if (!currentUser) { alert("Please login first."); return; }

  const data = {
    date: document.getElementById("mDate").value,
    name: document.getElementById("mName").value,
    college: document.getElementById("mCollege").value,
    phone: document.getElementById("mPhone").value,
    prant: document.getElementById("mPrant").value,
    district: document.getElementById("mDistrict").value,
    membershipId: document.getElementById("mMembershipId").value,
    addedBy: getAddedByLabel()
  };

  try {
    const res = await apiPost("addMembership", data);
    alert(res.message || "Membership added successfully");
    ["mDate","mName","mCollege","mPhone","mDistrict","mMembershipId"]
      .forEach(id => document.getElementById(id).value = "");
    loadDashboard();
  } catch (err) {
    alert("ERROR: " + err.message);
  }
}

initLogin();