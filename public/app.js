// Vanilla JS, no build step. Fetches real data from the tiny server's API
// endpoints and renders it as cards. Intentionally has no search box, filter,
// empty-state message, or contribution-status indicator — Assignment 4 has
// each participant add exactly one small feature like that themselves.

const THEME_KEY = "academy-practice-theme";

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") {
    document.documentElement.dataset.theme = saved;
  }
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
  });
}

function initNav() {
  const buttons = document.querySelectorAll("nav button[data-view]");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("selected"));
      button.classList.add("selected");
      document.querySelectorAll(".view").forEach((view) => {
        view.hidden = view.id !== `view-${button.dataset.view}`;
      });
    });
  });
}

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

async function loadProfiles() {
  const container = document.getElementById("profiles-list");
  container.innerHTML = '<p class="loading">Loading profiles…</p>';
  try {
    const res = await fetch("/api/profiles");
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const profiles = await res.json();
    container.innerHTML = profiles.map(profileCard).join("");
  } catch (err) {
    container.innerHTML = `<p class="error-message">Could not load profiles: ${err.message}</p>`;
  }
}

function profileCard(p) {
  return `
    <article class="card">
      <div class="card-header">
        <span class="avatar">${initials(p.name)}</span>
        <div>
          <h3>${escapeHtml(p.name)}</h3>
          <small>${escapeHtml(p.role || "")}${p.team ? " &middot; " + escapeHtml(p.team) : ""}</small>
        </div>
      </div>
      <dl>
        <div>
          <dt>Experience</dt>
          <dd>${escapeHtml(p.experience || "")}</dd>
        </div>
        <div>
          <dt>Learning goal</dt>
          <dd>${escapeHtml(p.learningGoal || "")}</dd>
        </div>
        <div>
          <dt>Workflow to improve</dt>
          <dd>${escapeHtml(p.workflowToImprove || "")}</dd>
        </div>
      </dl>
    </article>
  `;
}

async function loadGlossary() {
  const container = document.getElementById("glossary-list");
  container.innerHTML = '<p class="loading">Loading glossary…</p>';
  try {
    const res = await fetch("/api/glossary");
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const terms = await res.json();
    container.innerHTML = terms.map(glossaryCard).join("");
  } catch (err) {
    container.innerHTML = `<p class="error-message">Could not load glossary: ${err.message}</p>`;
  }
}

function glossaryCard(t) {
  return `
    <article class="card glossary-term">
      <span class="chip">${escapeHtml(t.term)}</span>
      <dl>
        <div>
          <dt>Definition</dt>
          <dd>${escapeHtml(t.definition || "")}</dd>
        </div>
        <div>
          <dt>Example</dt>
          <dd>${escapeHtml(t.example || "")}</dd>
        </div>
        <div>
          <dt>Common misconception</dt>
          <dd>${escapeHtml(t.commonMisconception || "")}</dd>
        </div>
        <div>
          <dt>Relevance</dt>
          <dd>${escapeHtml(t.relevance || "")}</dd>
        </div>
      </dl>
    </article>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

initTheme();
initNav();
loadProfiles();
loadGlossary();
