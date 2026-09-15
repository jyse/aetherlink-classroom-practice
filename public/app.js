// Vanilla JS, no build step. Fetches real data from the tiny server's API
// endpoints and renders it as cards. Intentionally has no search box, filter,
// empty-state message, or contribution-status indicator — Assignment 4 has
// each participant add exactly one small feature like that themselves.

const THEME_KEY = "academy-practice-theme";

// Explain It Back game state — kept in memory only, resets on page reload.
let glossaryTerms = [];
let conceptCards = [];
let currentGameTerm = null;

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

// --- Library (concept cards) -------------------------------------------

async function loadLibrary() {
  const container = document.getElementById("library-list");
  container.innerHTML = '<p class="loading">Loading concept cards&hellip;</p>';
  try {
    const res = await fetch("/api/concept-cards");
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const cards = await res.json();
    conceptCards = cards;
    container.innerHTML = cards.length
      ? cards.map(conceptCardMarkup).join("")
      : `
        <div class="empty-state">
          <img src="/assets/aetherbot-pointing.png" alt="AetherBOT pointing at an empty shelf" class="mascot mascot-empty" />
          <p class="muted">No concept cards yet. Turn a glossary term into one using the create-concept-card skill.</p>
        </div>
      `;
  } catch (err) {
    container.innerHTML = `<p class="error-message">Could not load the library: ${err.message}</p>`;
  }
}

function conceptCardFieldsHtml(c) {
  return `
    <div>
      <dt>Explanation</dt>
      <dd>${escapeHtml(c.explanation || "")}</dd>
    </div>
    <div>
      <dt>Example</dt>
      <dd>${escapeHtml(c.example || "")}</dd>
    </div>
    <div>
      <dt>Common misunderstanding</dt>
      <dd>${escapeHtml(c.commonMisunderstanding || "")}</dd>
    </div>
    <div>
      <dt>Essential points</dt>
      <dd><ul>${(c.essentialPoints || []).map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul></dd>
    </div>
    <div>
      <dt>Related concepts</dt>
      <dd>${(c.relatedConcepts || []).map(escapeHtml).join(", ")}</dd>
    </div>
    <div>
      <dt>Resources</dt>
      <dd><ul>${(c.resources || [])
        .map((r) => `<li><a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.label)}</a></li>`)
        .join("")}</ul></dd>
    </div>
  `;
}

function conceptCardMarkup(c) {
  return `
    <article class="card concept-card">
      <span class="chip">${escapeHtml(c.term)}</span>
      <dl>${conceptCardFieldsHtml(c)}</dl>
    </article>
  `;
}

function findConceptCard(term) {
  return conceptCards.find((c) => c.term.toLowerCase() === String(term || "").toLowerCase());
}

// --- Explain It Back game -----------------------------------------------

async function initGameData() {
  try {
    const [glossaryRes, cardsRes] = await Promise.all([fetch("/api/glossary"), fetch("/api/concept-cards")]);
    glossaryTerms = glossaryRes.ok ? await glossaryRes.json() : [];
    if (cardsRes.ok) conceptCards = await cardsRes.json();
  } catch {
    glossaryTerms = [];
  }
  pickRandomGameTerm();
}

function pickRandomGameTerm() {
  const chip = document.getElementById("game-term-chip");
  const loadingEl = document.getElementById("game-term-loading");

  if (!glossaryTerms.length) {
    loadingEl.textContent = "No glossary terms available yet — add one on the Glossary page first.";
    loadingEl.hidden = false;
    chip.hidden = true;
    currentGameTerm = null;
    return;
  }

  currentGameTerm = glossaryTerms[Math.floor(Math.random() * glossaryTerms.length)];
  chip.textContent = currentGameTerm.term;
  chip.hidden = false;
  loadingEl.hidden = true;

  document.getElementById("game-answer").value = "";
  document.getElementById("game-submit-status").textContent = "";
  resetFeedbackPanel();
  resetRevealPanel();
}

function resetFeedbackPanel() {
  document.getElementById("game-feedback-body").innerHTML = `
    <div class="waiting-note">
      <img src="/assets/aetherbot-thinking.png" alt="AetherBOT thinking" class="mascot mascot-inline" />
      <p class="muted">Submit an explanation, tell your Claude Code session to check it (for example: <em>"Check my latest submission using the term-checker skill."</em>), then click "Check feedback".</p>
    </div>
  `;
}

function resetRevealPanel() {
  document.getElementById("game-reveal-body").innerHTML =
    '<p class="muted">Reveal the approved card any time to self-review, independent of Claude\'s feedback.</p>';
}

async function submitExplanation() {
  const statusEl = document.getElementById("game-submit-status");
  const answerEl = document.getElementById("game-answer");
  const answer = answerEl.value.trim();

  if (!currentGameTerm) {
    statusEl.textContent = "No term loaded — click \"New term\" first.";
    return;
  }
  if (!answer) {
    statusEl.textContent = "Write an explanation before submitting.";
    return;
  }

  statusEl.textContent = "Submitting…";
  try {
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ term: currentGameTerm.term, explanation: answer }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);

    const time = new Date(data.submission.submittedAt).toLocaleTimeString();
    statusEl.textContent = `Submitted at ${time}. Now ask Claude Code to check it, then click "Check feedback".`;
    resetFeedbackPanel();
  } catch (err) {
    statusEl.textContent = `Could not submit: ${err.message}`;
  }
}

async function checkFeedback() {
  const body = document.getElementById("game-feedback-body");
  body.innerHTML = '<p class="loading">Checking&hellip;</p>';
  try {
    const res = await fetch("/api/feedback");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);

    if (!data.available) {
      body.innerHTML = `
        <div class="waiting-note">
          <img src="/assets/aetherbot-thinking.png" alt="AetherBOT thinking" class="mascot mascot-inline" />
          <p class="muted">Waiting for you to ask Claude Code to check this — try: <em>"Check my latest submission using the term-checker skill."</em></p>
        </div>
      `;
      return;
    }
    body.innerHTML = feedbackMarkup(data.feedback);
  } catch (err) {
    body.innerHTML = `<p class="error-message">Could not load feedback: ${err.message}</p>`;
  }
}

function feedbackMarkup(fb) {
  const ratingSlug = String(fb.rating || "unknown")
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `
    <span class="feedback-rating rating-${escapeHtml(ratingSlug)}">${escapeHtml(fb.rating || "Unknown")}</span>
    <p>${escapeHtml(fb.whatWasUnderstood || "")}</p>
    ${listFieldHtml("Missing elements", fb.missingElements)}
    ${listFieldHtml("Incorrect claims", fb.incorrectClaims)}
    ${listFieldHtml("Recommended resources", fb.recommendedResources)}
    ${fb.note ? `<p class="muted feedback-note">${escapeHtml(fb.note)}</p>` : ""}
  `;
}

function listFieldHtml(label, items) {
  if (!items || !items.length) return "";
  return `
    <div class="feedback-list">
      <dt>${escapeHtml(label)}</dt>
      <dd><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></dd>
    </div>
  `;
}

function revealConceptCard() {
  const body = document.getElementById("game-reveal-body");
  if (!currentGameTerm) return;

  const card = findConceptCard(currentGameTerm.term);
  if (card) {
    body.innerHTML = `<dl>${conceptCardFieldsHtml(card)}</dl>`;
    return;
  }

  body.innerHTML = `
    <p class="muted">No enriched concept card exists yet for "${escapeHtml(
      currentGameTerm.term
    )}" — showing the basic glossary entry it would be built from instead.</p>
    <dl>
      <div><dt>Definition</dt><dd>${escapeHtml(currentGameTerm.definition || "")}</dd></div>
      <div><dt>Example</dt><dd>${escapeHtml(currentGameTerm.example || "")}</dd></div>
      <div><dt>Common misconception</dt><dd>${escapeHtml(currentGameTerm.commonMisconception || "")}</dd></div>
      <div><dt>Relevance</dt><dd>${escapeHtml(currentGameTerm.relevance || "")}</dd></div>
    </dl>
  `;
}

function initGame() {
  document.getElementById("game-next").addEventListener("click", pickRandomGameTerm);
  document.getElementById("game-submit").addEventListener("click", submitExplanation);
  document.getElementById("game-check-feedback").addEventListener("click", checkFeedback);
  document.getElementById("game-reveal").addEventListener("click", revealConceptCard);
  initGameData();
}

initTheme();
initNav();
initGame();
loadProfiles();
loadGlossary();
loadLibrary();
