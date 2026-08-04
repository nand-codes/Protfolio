// ===== State Management =====
const STORAGE_KEY = "ml_journey_tracker";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { subtasks: {}, notes: {}, projects: [] };
  } catch { return { subtasks: {}, notes: {}, projects: [] }; }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

// ===== Utility =====
function getDaysRemaining() {
  const end = new Date(ROADMAP.endDate);
  const now = new Date();
  const diff = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  return diff;
}

function getSubtaskKey(topicId, idx) {
  return `${topicId}__${idx}`;
}

function calcTopicProgress(topic) {
  let done = 0;
  topic.subtasks.forEach((_, i) => {
    if (state.subtasks[getSubtaskKey(topic.id, i)]) done++;
  });
  return topic.subtasks.length ? Math.round((done / topic.subtasks.length) * 100) : 0;
}

function calcPhaseProgress(phase) {
  let total = 0, done = 0;
  phase.topics.forEach(t => {
    t.subtasks.forEach((_, i) => {
      total++;
      if (state.subtasks[getSubtaskKey(t.id, i)]) done++;
    });
  });
  return total ? Math.round((done / total) * 100) : 0;
}

function calcOverallProgress() {
  let total = 0, done = 0;
  ROADMAP.phases.forEach(p => {
    p.topics.forEach(t => {
      t.subtasks.forEach((_, i) => {
        total++;
        if (state.subtasks[getSubtaskKey(t.id, i)]) done++;
      });
    });
  });
  return total ? Math.round((done / total) * 100) : 0;
}

// ===== Render Timeline Nav =====
function renderTimeline() {
  const nav = document.getElementById("timeline-nav");
  nav.innerHTML = ROADMAP.phases.map((p, i) => {
    const pct = calcPhaseProgress(p);
    return `
      <button class="timeline-btn ${i === 0 ? 'active' : ''}" data-phase="${p.id}" onclick="scrollToPhase('${p.id}', this)">
        <span class="t-icon">${p.icon}</span>
        <span class="t-title">${p.title}</span>
        <span class="t-month">${p.month}</span>
        <div class="t-progress">
          <div class="t-progress-fill" style="width:${pct}%;background:${p.color}"></div>
        </div>
      </button>
    `;
  }).join("");
}

function scrollToPhase(id, btn) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelectorAll(".timeline-btn").forEach(b => b.classList.remove("active"));
  btn?.classList.add("active");
}

// ===== Render Phases =====
function renderPhases() {
  const container = document.getElementById("phases-container");
  container.innerHTML = ROADMAP.phases.map((phase, pi) => {
    const phasePct = calcPhaseProgress(phase);
    return `
      <div class="phase-card glass-card open" id="${phase.id}" style="animation-delay:${pi * 0.08}s">
        <div class="phase-header" onclick="togglePhase('${phase.id}')">
          <div class="phase-header-left">
            <div class="phase-icon" style="background:${phase.color}20">${phase.icon}</div>
            <div>
              <div class="phase-title">${phase.title}</div>
              <div class="phase-dates">${phase.dates}</div>
            </div>
          </div>
          <div class="phase-header-right">
            <span class="phase-pct" style="color:${phase.color}" id="pct-${phase.id}">${phasePct}%</span>
            <div class="phase-progress">
              <div class="phase-progress-fill" id="bar-${phase.id}" style="width:${phasePct}%;background:${phase.color}"></div>
            </div>
            <span class="phase-chevron">▾</span>
          </div>
        </div>
        <div class="phase-body">
          <div class="phase-body-inner">
            ${phase.topics.map(topic => renderTopic(topic, phase.color)).join("")}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderTopic(topic, color) {
  const pct = calcTopicProgress(topic);
  const noteVal = state.notes[topic.id] || "";
  return `
    <div class="topic-card" id="topic-${topic.id}">
      <div class="topic-header" onclick="toggleTopic('${topic.id}')">
        <div class="topic-header-left">
          <span class="topic-icon">${topic.icon}</span>
          <span class="topic-title">${topic.title}</span>
        </div>
        <div class="topic-header-right">
          <span class="topic-pct" id="tpct-${topic.id}">${pct}%</span>
          <div class="topic-progress">
            <div class="topic-progress-fill" id="tbar-${topic.id}" style="width:${pct}%;background:${color}"></div>
          </div>
          <span class="topic-chevron">▾</span>
        </div>
      </div>
      <div class="topic-body">
        <div class="subtask-list">
          ${topic.subtasks.map((st, i) => {
            const key = getSubtaskKey(topic.id, i);
            const checked = state.subtasks[key] ? "checked" : "";
            const completed = state.subtasks[key] ? "completed" : "";
            return `
              <div class="subtask-item ${completed}">
                <label class="custom-checkbox">
                  <input type="checkbox" ${checked} onchange="toggleSubtask('${topic.id}', ${i}, this)">
                  <span class="checkmark"></span>
                </label>
                <span class="subtask-label" onclick="this.previousElementSibling.querySelector('input').click()">${st}</span>
              </div>
            `;
          }).join("")}
        </div>
        <div class="topic-notes">
          <textarea placeholder="📝 Add notes for ${topic.title}..." onchange="saveNote('${topic.id}', this.value)" onfocus="this.style.minHeight='100px'" onblur="this.style.minHeight='60px'">${noteVal}</textarea>
        </div>
      </div>
    </div>
  `;
}

// ===== Toggle Handlers =====
function togglePhase(id) {
  document.getElementById(id)?.classList.toggle("open");
}

function toggleTopic(id) {
  document.getElementById("topic-" + id)?.classList.toggle("open");
}

// ===== Subtask Toggle =====
function toggleSubtask(topicId, idx, el) {
  const key = getSubtaskKey(topicId, idx);
  state.subtasks[key] = el.checked;
  saveState(state);

  const item = el.closest(".subtask-item");
  item.classList.toggle("completed", el.checked);

  if (el.checked) {
    item.style.transform = "scale(1.02)";
    setTimeout(() => item.style.transform = "", 200);
  }

  updateAllProgress();
}

function saveNote(topicId, val) {
  state.notes[topicId] = val;
  saveState(state);
}

// ===== Update Progress Displays =====
function updateAllProgress() {
  const overall = calcOverallProgress();
  document.getElementById("overall-pct").textContent = overall;
  document.getElementById("overall-fill").style.width = overall + "%";

  ROADMAP.phases.forEach(phase => {
    const pct = calcPhaseProgress(phase);
    const pctEl = document.getElementById("pct-" + phase.id);
    const barEl = document.getElementById("bar-" + phase.id);
    if (pctEl) pctEl.textContent = pct + "%";
    if (barEl) barEl.style.width = pct + "%";

    phase.topics.forEach(topic => {
      const tpct = calcTopicProgress(topic);
      const tpctEl = document.getElementById("tpct-" + topic.id);
      const tbarEl = document.getElementById("tbar-" + topic.id);
      if (tpctEl) tpctEl.textContent = tpct + "%";
      if (tbarEl) tbarEl.style.width = tpct + "%";
    });
  });

  // Update timeline
  document.querySelectorAll(".timeline-btn").forEach(btn => {
    const phaseId = btn.dataset.phase;
    const phase = ROADMAP.phases.find(p => p.id === phaseId);
    if (phase) {
      const pct = calcPhaseProgress(phase);
      const fill = btn.querySelector(".t-progress-fill");
      if (fill) fill.style.width = pct + "%";
    }
  });

  updateDaysRemaining();
  renderProjectsCount();
}

function updateDaysRemaining() {
  document.getElementById("days-remaining").textContent = getDaysRemaining();
}

// ===== Projects =====
function renderProjects() {
  const grid = document.getElementById("projects-grid");
  if (!state.projects || state.projects.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding:40px; color:var(--text-muted);">
        <div style="font-size:2.5rem; margin-bottom:12px;">🚀</div>
        <p>No projects yet. Click <strong>"+ Add Project"</strong> to track your production projects!</p>
      </div>
    `;
    return;
  }
  grid.innerHTML = state.projects.map((proj, i) => {
    const statusClass = proj.status.replace(/\s+/g, "-").toLowerCase();
    return `
      <div class="project-card">
        <span class="project-status ${statusClass}">${proj.status}</span>
        <h3>${escapeHtml(proj.name)}</h3>
        <p>${escapeHtml(proj.description || "No description")}</p>
        <div class="project-tags">
          ${(proj.tags || []).map(t => `<span class="project-tag">${escapeHtml(t)}</span>`).join("")}
        </div>
        <div class="project-actions">
          <button onclick="editProject(${i})">✏️ Edit</button>
          <button onclick="cycleStatus(${i})">🔄 Status</button>
          <button class="delete-btn" onclick="deleteProject(${i})">🗑️</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderProjectsCount() {
  const completed = (state.projects || []).filter(p => p.status === "completed").length;
  const total = Math.max(6, (state.projects || []).length);
  document.getElementById("projects-count").textContent = `${completed}/${total}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ===== Project Modal =====
function showModal(html) {
  document.getElementById("modal-content").innerHTML = html;
  document.getElementById("modal-overlay").classList.add("active");
}

function hideModal() {
  document.getElementById("modal-overlay").classList.remove("active");
}

document.getElementById("modal-close").addEventListener("click", hideModal);
document.getElementById("modal-overlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) hideModal();
});

document.getElementById("add-project-btn").addEventListener("click", () => {
  showModal(`
    <h3>🚀 Add New Project</h3>
    <label>Project Name</label>
    <input type="text" id="proj-name" placeholder="e.g. Real-time Fraud Detection System">
    <label>Description</label>
    <textarea id="proj-desc" rows="3" placeholder="Brief description of the project..."></textarea>
    <label>Tech Tags (comma-separated)</label>
    <input type="text" id="proj-tags" placeholder="e.g. PyTorch, FastAPI, Docker, AWS">
    <label>Status</label>
    <select id="proj-status">
      <option value="not-started">Not Started</option>
      <option value="in-progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>
    <button class="btn-submit" onclick="submitProject()">Add Project</button>
  `);
});

function submitProject() {
  const name = document.getElementById("proj-name").value.trim();
  if (!name) return;
  const desc = document.getElementById("proj-desc").value.trim();
  const tags = document.getElementById("proj-tags").value.split(",").map(t => t.trim()).filter(Boolean);
  const status = document.getElementById("proj-status").value;
  state.projects.push({ name, description: desc, tags, status });
  saveState(state);
  renderProjects();
  renderProjectsCount();
  hideModal();
}

function editProject(idx) {
  const proj = state.projects[idx];
  showModal(`
    <h3>✏️ Edit Project</h3>
    <label>Project Name</label>
    <input type="text" id="proj-name" value="${escapeHtml(proj.name)}">
    <label>Description</label>
    <textarea id="proj-desc" rows="3">${escapeHtml(proj.description || "")}</textarea>
    <label>Tech Tags (comma-separated)</label>
    <input type="text" id="proj-tags" value="${(proj.tags || []).join(", ")}">
    <label>Status</label>
    <select id="proj-status">
      <option value="not-started" ${proj.status === "not-started" ? "selected" : ""}>Not Started</option>
      <option value="in-progress" ${proj.status === "in-progress" ? "selected" : ""}>In Progress</option>
      <option value="completed" ${proj.status === "completed" ? "selected" : ""}>Completed</option>
    </select>
    <button class="btn-submit" onclick="updateProject(${idx})">Save Changes</button>
  `);
}

function updateProject(idx) {
  state.projects[idx] = {
    name: document.getElementById("proj-name").value.trim(),
    description: document.getElementById("proj-desc").value.trim(),
    tags: document.getElementById("proj-tags").value.split(",").map(t => t.trim()).filter(Boolean),
    status: document.getElementById("proj-status").value
  };
  saveState(state);
  renderProjects();
  renderProjectsCount();
  hideModal();
}

function cycleStatus(idx) {
  const order = ["not-started", "in-progress", "completed"];
  const cur = order.indexOf(state.projects[idx].status);
  state.projects[idx].status = order[(cur + 1) % order.length];
  saveState(state);
  renderProjects();
  renderProjectsCount();
}

function deleteProject(idx) {
  if (confirm("Delete this project?")) {
    state.projects.splice(idx, 1);
    saveState(state);
    renderProjects();
    renderProjectsCount();
  }
}

// ===== Scroll Spy for Timeline =====
function setupScrollSpy() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll(".timeline-btn").forEach(b => b.classList.remove("active"));
        document.querySelector(`.timeline-btn[data-phase="${entry.target.id}"]`)?.classList.add("active");
      }
    });
  }, { rootMargin: "-30% 0px -60% 0px" });

  ROADMAP.phases.forEach(p => {
    const el = document.getElementById(p.id);
    if (el) observer.observe(el);
  });
}

// ===== Init =====
function init() {
  renderTimeline();
  renderPhases();
  renderProjects();
  updateAllProgress();
  setupScrollSpy();
}

document.addEventListener("DOMContentLoaded", init);
