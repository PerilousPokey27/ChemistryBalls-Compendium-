/* ==========================================================================
   auth.js — powers auth.html (login + register)

   GOOGLE SIGN-IN SETUP (free — no Google charge for this):
   1. Go to https://console.cloud.google.com/ → create a project (free).
   2. APIs & Services → Credentials → Create Credentials → OAuth client ID
      → Application type: "Web application".
   3. Under "Authorized JavaScript origins" add the exact origin you're
      testing/hosting from, e.g. http://localhost:8000 for local testing,
      or https://yoursite.com once deployed. Google Sign-In will NOT work
      opened as a plain file:// page — it needs a real http/https origin,
      so serve this folder locally (see README.md) or host it for free
      on GitHub Pages / Netlify / Vercel.
   4. Copy the generated Client ID and paste it below, replacing
      GOOGLE_CLIENT_ID's placeholder value.
   Until you do that, the button below will show a setup reminder instead
   of a working Google button — everything else on the site still works.
   ========================================================================== */

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, no need to be here.
  if (Storage.getCurrentUser()) {
    window.location.href = "profile.html";
    return;
  }

  wireTabs();
  wireLoginForm();
  wireRegisterForm();
  setupGoogleSignIn();
});

/* ---------- Google Sign-In ---------- */

function setupGoogleSignIn() {
  const noteEl = document.getElementById("google-note");

  if (GOOGLE_CLIENT_ID.startsWith("YOUR_")) {
    noteEl.textContent = "Google sign-in needs a free Client ID from Google Cloud Console before it'll work — see the comment at the top of js/auth.js.";
    return;
  }

  if (typeof google === "undefined" || !google.accounts) {
    noteEl.textContent = "Google sign-in script didn't load (are you offline, or opening this as a file:// page instead of serving it?).";
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
  });

  google.accounts.id.renderButton(document.getElementById("google-btn-container"), {
    theme: "filled_black",
    shape: "pill",
    size: "large",
    text: "continue_with",
  });
}

function handleGoogleCredential(response) {
  // NOTE: this decodes the ID token client-side to read the profile —
  // it is NOT cryptographically verified (that normally happens on a
  // server). Fine for a personal/hobby site with no sensitive data
  // behind it; don't treat this as production-grade auth.
  const payload = decodeJwtPayload(response.credential);
  if (!payload) {
    document.getElementById("login-error").textContent = "Couldn't read the Google response — try again.";
    return;
  }

  const username = "google_" + payload.sub;
  let user = Storage.findUser(username);

  if (!user) {
    user = Storage.createUser({
      username,
      password: payload.sub, // never shown to the person; not a real login path for this account
      displayName: payload.name || payload.email || "Explorer",
    });
  }

  Storage.setSession(user.username);
  window.location.href = "profile.html";
}

function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch (err) {
    return null;
  }
}

function wireTabs() {
  const loginTab = document.getElementById("tab-login");
  const registerTab = document.getElementById("tab-register");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  loginTab.addEventListener("click", () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  });

  registerTab.addEventListener("click", () => {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  });
}

function wireLoginForm() {
  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("login-error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    const user = Storage.verifyUser(username, password);
    if (!user) {
      errorEl.textContent = "Incorrect username or password.";
      return;
    }

    Storage.setSession(user.username);
    window.location.href = "profile.html";
  });
}

function wireRegisterForm() {
  const form = document.getElementById("register-form");
  const errorEl = document.getElementById("register-error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("register-username").value.trim();
    const displayName = document.getElementById("register-displayname").value.trim();
    const password = document.getElementById("register-password").value;
    const confirm = document.getElementById("register-confirm").value;

    if (!username || !password) {
      errorEl.textContent = "Username and password are required.";
      return;
    }
    if (username.length < 3) {
      errorEl.textContent = "Username must be at least 3 characters.";
      return;
    }
    if (password.length < 4) {
      errorEl.textContent = "Password must be at least 4 characters.";
      return;
    }
    if (password !== confirm) {
      errorEl.textContent = "Passwords don't match.";
      return;
    }
    if (Storage.findUser(username)) {
      errorEl.textContent = "That username is already taken.";
      return;
    }

    const user = Storage.createUser({ username, password, displayName });
    Storage.setSession(user.username);
    window.location.href = "profile.html";
  });
}
