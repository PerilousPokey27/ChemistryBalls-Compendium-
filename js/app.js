/* ==========================================================================
   app.js — powers index.html (the atlas grid)
   ========================================================================== */

let currentEntries = [];
let searchTerm = "";
let categoryFilter = "all";
let currentPage = 1;
const PAGE_SIZE = 60;

document.addEventListener("DOMContentLoaded", () => {
  renderNav();
  currentEntries = Storage.getEntries();
  populateCategoryFilter();
  const params = new URLSearchParams(window.location.search);
  const pageParam = parseInt(params.get("page"), 10);
  if (pageParam > 0) currentPage = pageParam;
  renderGrid();
  wireControls();
  wireAddEntryForm();
});

/* ---------- Nav ---------- */

function renderNav() {
  const nav = document.getElementById("nav-links");
  const user = Storage.getCurrentUser();

  if (user) {
    nav.innerHTML = `
      <button id="add-entry-btn" class="primary">+ Add Entry</button>
      <a href="profile.html">${escapeHTML(user.displayName)}</a>
      <button id="logout-btn">Log out</button>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => {
      Storage.clearSession();
      renderNav();
    });
    document.getElementById("add-entry-btn").addEventListener("click", openAddEntryModal);
  } else {
    nav.innerHTML = `<a class="primary" href="auth.html">Log in / Sign up</a>`;
  }
}

/* ---------- Grid rendering ---------- */

function populateCategoryFilter() {
  const select = document.getElementById("category-filter");
  const categories = Array.from(new Set(currentEntries.map((e) => e.category))).sort();
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

function renderGrid() {
  const grid = document.getElementById("atlas-grid");
  const pager = document.getElementById("pager");

  const filtered = currentEntries.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">No entries match yet. Try a different search, or add one.</div>`;
    pager.innerHTML = "";
    return;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  grid.innerHTML = pageItems
    .map((entry) => {
      const num = String(currentEntries.indexOf(entry) + 1).padStart(3, "0");
      const src = entry.image || generatePlaceholderDataURL(entry.name);
      const rarityTag = entry.rarity != null
        ? `<span class="rarity-tag">Rarity ${entry.rarity}</span>`
        : "";
      return `
        <button class="stamp" data-id="${entry.id}" data-name="${escapeHTML(entry.name)}" aria-label="View ${escapeHTML(entry.name)}">
          <div class="index-no">No. ${num}</div>
          <div class="ball-wrap">
            <img src="${src}" alt="${escapeHTML(entry.name)}" loading="lazy" />
          </div>
          <h3>${escapeHTML(entry.name)}</h3>
          <span class="category-tag">${escapeHTML(entry.category)}</span>
          ${rarityTag}
        </button>
      `;
    })
    .join("");

  grid.querySelectorAll(".stamp").forEach((btn) => {
    const img = btn.querySelector("img");
    img.addEventListener(
      "error",
      () => {
        img.src = generatePlaceholderDataURL(btn.dataset.name);
      },
      { once: true }
    );
    btn.addEventListener("click", () => {
      window.location.href = "entry.html?id=" + encodeURIComponent(btn.dataset.id) + "&from=" + currentPage;
    });
  });

  renderPager(totalPages, filtered.length);
}

function renderPager(totalPages, totalCount) {
  const pager = document.getElementById("pager");
  if (totalPages <= 1) {
    pager.innerHTML = `<div class="pager-count">${totalCount} entries</div>`;
    return;
  }

  const maxButtons = 7;
  let pages = [];
  if (totalPages <= maxButtons) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    pages = [1, 2, "…", currentPage - 1, currentPage, currentPage + 1, "…", totalPages]
      .filter((p, i, arr) => p !== undefined && p >= 1 && p <= totalPages)
      .filter((p, i, arr) => arr.indexOf(p) === i || p === "…");
  }

  pager.innerHTML = `
    <div class="pager-count">${totalCount} entries — page ${currentPage} of ${totalPages}</div>
    <div class="pager-buttons">
      <button class="pager-btn" id="pager-prev" ${currentPage === 1 ? "disabled" : ""}>&larr; Prev</button>
      ${pages
        .map((p) =>
          p === "…"
            ? `<span class="pager-ellipsis">…</span>`
            : `<button class="pager-btn ${p === currentPage ? "active" : ""}" data-page="${p}">${p}</button>`
        )
        .join("")}
      <button class="pager-btn" id="pager-next" ${currentPage === totalPages ? "disabled" : ""}>Next &rarr;</button>
    </div>
    <form class="pager-jump" id="pager-jump-form">
      <label for="pager-jump-input">Go to page</label>
      <input type="number" id="pager-jump-input" min="1" max="${totalPages}" placeholder="${currentPage}" />
      <button type="submit" class="pager-btn">Go</button>
    </form>
  `;

  document.getElementById("pager-jump-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("pager-jump-input");
    const target = parseInt(input.value, 10);
    if (target >= 1 && target <= totalPages) {
      currentPage = target;
      renderGrid();
      document.getElementById("atlas-grid").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  pager.querySelectorAll(".pager-btn[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPage = parseInt(btn.dataset.page, 10);
      renderGrid();
      document.getElementById("atlas-grid").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  const prevBtn = document.getElementById("pager-prev");
  const nextBtn = document.getElementById("pager-next");
  if (prevBtn) prevBtn.addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; renderGrid(); document.getElementById("atlas-grid").scrollIntoView({ behavior: "smooth", block: "start" }); }
  });
  if (nextBtn) nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) { currentPage++; renderGrid(); document.getElementById("atlas-grid").scrollIntoView({ behavior: "smooth", block: "start" }); }
  });
}

function wireControls() {
  document.getElementById("search-input").addEventListener("input", (e) => {
    searchTerm = e.target.value;
    currentPage = 1;
    renderGrid();
  });
  document.getElementById("category-filter").addEventListener("change", (e) => {
    categoryFilter = e.target.value;
    currentPage = 1;
    renderGrid();
  });
}

/* ---------- Add entry ---------- */

function openAddEntryModal() {
  document.getElementById("add-entry-modal").classList.add("open");
}

function closeAddEntryModal() {
  document.getElementById("add-entry-modal").classList.remove("open");
  document.getElementById("add-entry-form").reset();
}

function wireAddEntryForm() {
  document.getElementById("add-entry-close").addEventListener("click", closeAddEntryModal);
  document.getElementById("add-entry-modal").addEventListener("click", (e) => {
    if (e.target.id === "add-entry-modal") closeAddEntryModal();
  });

  document.getElementById("add-entry-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = Storage.getCurrentUser();
    if (!user) return;

    const name = document.getElementById("entry-name").value.trim();
    const category = document.getElementById("entry-category").value.trim() || "Custom";
    const description = document.getElementById("entry-description").value.trim();
    const fileInput = document.getElementById("entry-image");
    const errorEl = document.getElementById("add-entry-error");

    if (!name || !description) return;

    let image = null;
    if (fileInput.files && fileInput.files[0]) {
      try {
        image = await fileToResizedDataURL(fileInput.files[0], 400);
      } catch (err) {
        errorEl.textContent = "Couldn't read that image — try a different file.";
        return;
      }
    }

    Storage.addEntry({
      name,
      category,
      description,
      image, // null falls back to images/default-ball.png at render time
      addedBy: user.username,
    });

    currentEntries = Storage.getEntries();
    populateCategoryFilterRefresh();
    renderGrid();
    closeAddEntryModal();
  });
}

/**
 * Reads an image file, draws it center-cropped into a square canvas at
 * `size`x`size`, and returns a PNG data URL. Keeps uploaded images from
 * bloating localStorage and gives every entry a consistent square/round
 * crop regardless of the original photo's shape.
 */
function fileToResizedDataURL(file, size) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Not a readable image"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function populateCategoryFilterRefresh() {
  const select = document.getElementById("category-filter");
  const existing = new Set(Array.from(select.options).map((o) => o.value));
  const categories = Array.from(new Set(currentEntries.map((e) => e.category)));
  categories.forEach((cat) => {
    if (!existing.has(cat)) {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    }
  });
}

/* ---------- Utility ---------- */

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
