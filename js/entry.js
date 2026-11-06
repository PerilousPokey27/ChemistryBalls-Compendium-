/* ==========================================================================
   entry.js — powers entry.html (a single Compendium entry's own page)
   Layout: image card on one side, stacked detail panels on the other —
   deliberately a different arrangement/style from any particular app,
   built from this site's own data fields (no stats/rarity data exists
   here, so none is invented just to look similar to one).
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  renderNav();

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const fromPage = params.get("from");
  if (fromPage) {
    document.getElementById("back-link").href = "index.html?page=" + encodeURIComponent(fromPage);
  }

  const entries = Storage.getEntries();
  const entry = entries.find((e) => e.id === id);
  const root = document.getElementById("detail-root");

  if (!entry) {
    root.innerHTML = `
      <div class="detail-panel not-found-panel">
        <p class="not-found">This entry doesn't exist — it may have been removed, or the link is off.</p>
        <a class="btn" href="index.html" style="display:inline-block;width:auto;">Back to the Compendium</a>
      </div>
    `;
    return;
  }

  const num = String(entries.indexOf(entry) + 1).padStart(3, "0");
  const src = entry.image || generatePlaceholderDataURL(entry.name);
  const rarityRow = entry.rarity != null
    ? `<div class="detail-row"><span>Rarity</span><span>${entry.rarity}</span></div>`
    : "";

  root.innerHTML = `
    <div class="detail-grid">
      <div class="detail-image-card">
        <span class="dex-badge">No. ${num}</span>
        <img src="${src}" alt="${escapeHTML(entry.name)}" id="detail-img" />
      </div>
      <div class="detail-info">
        <div class="detail-panel">
          <h1>${escapeHTML(entry.name)}</h1>
          <span class="category-tag">${escapeHTML(entry.category)}</span>
          ${rarityRow}
          <div class="detail-row"><span>Added by</span><span>${escapeHTML(entry.addedBy)}</span></div>
          <div class="detail-row"><span>Date added</span><span>${new Date(entry.dateAdded).toLocaleDateString()}</span></div>
        </div>
        <div class="detail-panel">
          <h2>Description</h2>
          <p class="description">${escapeHTML(entry.description)}</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById("detail-img").addEventListener(
    "error",
    (e) => {
      e.target.src = generatePlaceholderDataURL(entry.name);
    },
    { once: true }
  );
});

/* ---------- Nav (same behavior as the Compendium page) ---------- */

function renderNav() {
  const nav = document.getElementById("nav-links");
  const user = Storage.getCurrentUser();

  if (user) {
    nav.innerHTML = `
      <a href="profile.html">${escapeHTML(user.displayName)}</a>
      <button id="logout-btn">Log out</button>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => {
      Storage.clearSession();
      renderNav();
    });
  } else {
    nav.innerHTML = `<a class="primary" href="auth.html">Log in / Sign up</a>`;
  }
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
