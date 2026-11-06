/* ==========================================================================
   profile.js — powers profile.html (the "passport")
   ========================================================================== */

let activeUser = null;

document.addEventListener("DOMContentLoaded", () => {
  activeUser = Storage.getCurrentUser();
  if (!activeUser) {
    window.location.href = "auth.html";
    return;
  }

  renderPassport();
  wireEditForm();
  wireLogout();
});

function renderPassport() {
  document.getElementById("passport-ball").innerHTML = ballSVG(activeUser.colors);
  document.getElementById("passport-name").textContent = activeUser.displayName;
  document.getElementById("passport-since").textContent =
    "Passport issued " + new Date(activeUser.joined).toLocaleDateString();
  document.getElementById("passport-bio").textContent =
    activeUser.bio || "No bio yet — add one below.";

  // Pre-fill edit form
  document.getElementById("edit-displayname").value = activeUser.displayName;
  document.getElementById("edit-bio").value = activeUser.bio || "";
  const colors = activeUser.colors.length ? activeUser.colors : ["#B6432E", "#F2EAD3"];
  document.getElementById("edit-color-1").value = colors[0] || "#B6432E";
  document.getElementById("edit-color-2").value = colors[1] || "#F2EAD3";

  renderStamps();
}

function renderStamps() {
  const entries = Storage.getEntries().filter((e) => e.addedBy === activeUser.username);
  const list = document.getElementById("stamps-list");

  if (entries.length === 0) {
    list.innerHTML = `<div class="no-stamps">No stamps yet — add an entry to the Compendium to earn your first one.</div>`;
    return;
  }

  list.innerHTML = entries
    .map(
      (e) => `
      <div class="mini-stamp">
        <span class="ball-wrap">${ballSVG(e.colors)}</span>
        <span>${escapeHTML(e.name)}</span>
      </div>
    `
    )
    .join("");
}

function wireEditForm() {
  document.getElementById("edit-profile-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const displayName = document.getElementById("edit-displayname").value.trim() || activeUser.username;
    const bio = document.getElementById("edit-bio").value.trim();
    const colors = [
      document.getElementById("edit-color-1").value,
      document.getElementById("edit-color-2").value,
    ];

    activeUser = Storage.updateUser(activeUser.username, { displayName, bio, colors });
    renderPassport();
  });
}

function wireLogout() {
  document.getElementById("logout-btn").addEventListener("click", () => {
    Storage.clearSession();
    window.location.href = "index.html";
  });
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
