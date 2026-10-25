// Semester Tracker - plain JavaScript, data saved in the browser (localStorage)
const KEY = "semester-tracker-tasks";
let tasks = load();
let filter = "all";

const form = document.getElementById("task-form");
const list = document.getElementById("list");
const empty = document.getElementById("empty");
const summary = document.getElementById("summary");
const progress = document.getElementById("progress");

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
function save() { localStorage.setItem(KEY, JSON.stringify(tasks)); }

function today() { return new Date().toISOString().slice(0, 10); }

function addTask(e) {
  e.preventDefault();
  tasks.push({
    id: Date.now(),
    title: form.title.value.trim(),
    subject: form.subject.value.trim(),
    due: form.due.value,
    priority: form.priority.value,
    done: false,
  });
  form.reset();
  form.priority.value = "medium";
  save(); render();
}

function toggle(id) {
  const t = tasks.find(t => t.id === id);
  t.done = !t.done;
  save(); render();
}

function remove(id) {
  tasks = tasks.filter(t => t.id !== id);
  save(); render();
}

function render() {
  const order = { high: 0, medium: 1, low: 2 };
  const visible = tasks
    .filter(t => filter === "all" || (filter === "done") === t.done)
    .sort((a, b) => a.done - b.done || a.due.localeCompare(b.due) || order[a.priority] - order[b.priority]);

  list.innerHTML = "";
  visible.forEach(t => {
    const overdue = !t.done && t.due < today();
    const li = document.createElement("li");
    li.className = `${t.priority} ${t.done ? "done" : ""} ${overdue ? "overdue" : ""}`;

    const box = document.createElement("input");
    box.type = "checkbox"; box.checked = t.done;
    box.setAttribute("aria-label", `Mark ${t.title} as done`);
    box.addEventListener("change", () => toggle(t.id));

    const info = document.createElement("div");
    info.className = "info";
    const name = document.createElement("div");
    name.className = "name"; name.textContent = t.title;   // textContent avoids XSS
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${t.subject} - due ${t.due}${overdue ? " (overdue)" : ""}`;
    info.append(name, meta);

    const del = document.createElement("button");
    del.className = "del"; del.textContent = "x";
    del.setAttribute("aria-label", `Delete ${t.title}`);
    del.addEventListener("click", () => remove(t.id));

    li.append(box, info, del);
    list.append(li);
  });

  empty.hidden = visible.length > 0;
  const done = tasks.filter(t => t.done).length;
  summary.textContent = tasks.length
    ? `${done} of ${tasks.length} tasks done`
    : "Add your first assignment below.";
  progress.style.width = tasks.length ? (done / tasks.length) * 100 + "%" : "0";
}

document.getElementById("filters").addEventListener("click", e => {
  if (!e.target.dataset.filter) return;
  filter = e.target.dataset.filter;
  document.querySelectorAll("#filters button").forEach(b => b.classList.toggle("active", b === e.target));
  render();
});
form.addEventListener("submit", addTask);
render();
