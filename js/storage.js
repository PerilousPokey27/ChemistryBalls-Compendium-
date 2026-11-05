/* ==========================================================================
   storage.js
   All persistence for the site lives in the browser's localStorage under
   the "cbAtlas_" namespace. There is no server — this is a fully static
   site, which keeps hosting free but means data only lives on the device/
   browser that created it. See the note in README.md if you outgrow this.

   NOTE ON PASSWORDS: Storage.simpleHash() is NOT real security — it's a
   basic obfuscation so passwords aren't sitting in plain text in devtools.
   Do not reuse a real/important password when testing this site, and
   don't treat this auth system as production-grade until it's backed by
   a real server with proper hashing (e.g. bcrypt) over HTTPS.
   ========================================================================== */

const Storage = (() => {
  const USERS_KEY = "cbAtlas_users";
  const SESSION_KEY = "cbAtlas_session";
  const ENTRIES_KEY = "cbAtlas_entries";
  const SEED_VERSION_KEY = "cbAtlas_seed_version";

  function simpleHash(str) {
    // Basic reversible obfuscation only — see NOTE above.
    return btoa(unescape(encodeURIComponent(str)));
  }

  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function findUser(username) {
    return getUsers().find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
  }

  function createUser({ username, password, displayName }) {
    const users = getUsers();
    const user = {
      username,
      passwordHash: simpleHash(password),
      displayName: displayName || username,
      bio: "",
      colors: randomBallColors(),
      joined: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
    return user;
  }

  function verifyUser(username, password) {
    const user = findUser(username);
    if (!user) return null;
    return user.passwordHash === simpleHash(password) ? user : null;
  }

  function updateUser(username, updates) {
    const users = getUsers();
    const idx = users.findIndex(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    return users[idx];
  }

  function getSession() {
    return localStorage.getItem(SESSION_KEY);
  }

  function setSession(username) {
    localStorage.setItem(SESSION_KEY, username);
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getCurrentUser() {
    const username = getSession();
    return username ? findUser(username) : null;
  }

  function getEntries() {
    const raw = localStorage.getItem(ENTRIES_KEY);
    const storedVersion = localStorage.getItem(SEED_VERSION_KEY);
    const currentVersion = typeof SEED_VERSION !== "undefined" ? SEED_VERSION : null;
    const seeded = typeof defaultEntries !== "undefined" ? defaultEntries : [];

    if (raw && storedVersion === currentVersion) {
      return JSON.parse(raw);
    }

    if (raw && storedVersion !== currentVersion) {
      // The built-in dataset (data.js) changed since this browser last
      // loaded the site. Refresh the built-in ("atlas") entries but keep
      // anything this visitor personally added through "Add Entry".
      const existing = JSON.parse(raw);
      const userAdded = existing.filter((e) => e.addedBy !== "atlas");
      const merged = [...seeded, ...userAdded];
      saveEntries(merged);
      if (currentVersion) localStorage.setItem(SEED_VERSION_KEY, currentVersion);
      return merged;
    }

    // First time this browser has ever loaded the site.
    saveEntries(seeded);
    if (currentVersion) localStorage.setItem(SEED_VERSION_KEY, currentVersion);
    return seeded;
  }

  function saveEntries(entries) {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }

  function addEntry(entry) {
    const entries = getEntries();
    const newEntry = {
      id: Date.now().toString(36),
      dateAdded: new Date().toISOString(),
      ...entry,
    };
    entries.push(newEntry);
    saveEntries(entries);
    return newEntry;
  }

  function randomBallColors() {
    const palette = ["#B6432E", "#3E8E88", "#C9A227", "#4B5FA6", "#7A8B4A", "#8C4A8C"];
    const shuffled = [...palette].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2 + Math.round(Math.random()));
  }

  return {
    createUser,
    findUser,
    verifyUser,
    updateUser,
    getSession,
    setSession,
    clearSession,
    getCurrentUser,
    getEntries,
    saveEntries,
    addEntry,
    randomBallColors,
  };
})();
