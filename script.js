// =============== Utilities ===============
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];
const setAttr = (el, a, v) => el.setAttribute(a, v);

// Toast helper
const toastEl = $("#toast");
let toastTimer = null;
function showToast(msg = "Action completed!") {
  toastEl.textContent = msg;
  toastEl.classList.remove("hidden");
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
    setTimeout(() => toastEl.classList.add("hidden"), 200);
  }, 1800);
}

// =============== Theme (Dark/Light) ===============
const themeToggle = $("#themeToggle");
const htmlEl = document.documentElement;

function applyTheme(theme) {
  htmlEl.setAttribute("data-theme", theme);
  const dark = theme === "dark";
  themeToggle.textContent = dark ? "☀️ Light Mode" : "🌙 Dark Mode";
  themeToggle.setAttribute("aria-pressed", String(dark));
}

function initTheme() {
  const saved = localStorage.getItem("theme") || "light";
  applyTheme(saved);
}
initTheme();

themeToggle.addEventListener("click", () => {
  const current = htmlEl.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("theme", next);
});

// =============== Part 1: Event Handling ===============
const clickBtn = $("#clickMeBtn");
const clickMessage = $("#clickMessage");
clickBtn.addEventListener("click", () => {
  clickMessage.textContent = "🎉 Button clicked!";
  showToast("Button clicked");
});

const typeBox = $("#typeBox");
const typeMessage = $("#typeMessage");
typeBox.addEventListener("keyup", () => {
  typeMessage.textContent = `You typed: "${typeBox.value}"`;
});

// Hover / focus box
const hoverBox = $("#hoverBox");
const hoverMsg = $("#hoverMsg");
function setHover(active) {
  hoverBox.style.background = active
    ? "color-mix(in oklab, var(--accent) 18%, transparent)"
    : "transparent";
  hoverMsg.textContent = active
    ? "✨ Hover ON (also works with keyboard focus)"
    : "";
}
hoverBox.addEventListener("mouseenter", () => setHover(true));
hoverBox.addEventListener("mouseleave", () => setHover(false));
hoverBox.addEventListener("focus", () => setHover(true));
hoverBox.addEventListener("blur", () => setHover(false));

// =============== Part 2: Interactive Elements ===============
// Counter (shift-click = ±5, dblclick reset)
let count = 0;
const countEl = $("#count");
$("#increase").addEventListener("click", (e) => {
  count += e.shiftKey ? 5 : 1;
  countEl.textContent = count;
});
$("#decrease").addEventListener("click", (e) => {
  count -= e.shiftKey ? 5 : 1;
  countEl.textContent = count;
});
countEl.addEventListener("dblclick", () => {
  count = 0;
  countEl.textContent = count;
  showToast("Counter reset");
});
$("#randomize").addEventListener("click", () => {
  count = Math.floor(Math.random() * 101);
  countEl.textContent = count;
});

// Like button
const likeBtn = $("#likeBtn");
const likeMsg = $("#likeMsg");
likeBtn.addEventListener("click", () => {
  const pressed = likeBtn.getAttribute("aria-pressed") === "true";
  likeBtn.setAttribute("aria-pressed", String(!pressed));
  likeBtn.textContent = pressed ? "♡ Like" : "♥ Liked";
  likeMsg.textContent = pressed ? "You unliked this." : "Thanks for the like!";
});

// Dropdown (with outside click + Esc)
const dropdownBtn = $("#dropdownBtn");
const dropdownMenu = $("#dropdownMenu");
function closeDropdown() {
  dropdownMenu.classList.add("hidden");
  setAttr(dropdownBtn, "aria-expanded", "false");
}
dropdownBtn.addEventListener("click", () => {
  const expanded = dropdownBtn.getAttribute("aria-expanded") === "true";
  if (expanded) closeDropdown();
  else {
    dropdownMenu.classList.remove("hidden");
    setAttr(dropdownBtn, "aria-expanded", "true");
  }
});
document.addEventListener("click", (e) => {
  if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target))
    closeDropdown();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDropdown();
});

// Dropdown actions
dropdownMenu.addEventListener("click", (e) => {
  const btn = e.target.closest(".menu-item");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "toast") showToast("Here’s your toast 🍞");
  if (action === "open-modal") openModal();
  if (action === "copy") copyCode();
  closeDropdown();
});

// Copy to clipboard
const copyInput = $("#copyInput");
$("#copyBtn").addEventListener("click", copyCode);
function copyCode() {
  navigator.clipboard
    .writeText(copyInput.value)
    .then(() => showToast("Copied to clipboard ✅"))
    .catch(() => showToast("Copy failed ❌"));
}

// Tabs
const tabs = $$(".tab");
const panels = $$(".tab-panel");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("active");
      setAttr(t, "aria-selected", "false");
    });
    panels.forEach((p) => p.classList.remove("show"));
    tab.classList.add("active");
    setAttr(tab, "aria-selected", "true");
    $("#" + tab.dataset.tab).classList.add("show");
  });
});

// Modal
const modal = $("#modal");
const closeModalBtn = $("#closeModal");
function openModal() {
  modal.classList.remove("hidden");
}
function closeModal() {
  modal.classList.add("hidden");
}
closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
});

// =============== Part 3: Form Validation (Live) ===============
const form = $("#myForm");
const nameField = $("#name");
const emailField = $("#email");
const phoneField = $("#phone");
const passwordField = $("#password");
const confirmField = $("#confirm");
const terms = $("#terms");
const submitBtn = $("#submitBtn");

const nameError = $("#nameError");
const emailError = $("#emailError");
const phoneError = $("#phoneError");
const passwordError = $("#passwordError");
const confirmError = $("#confirmError");
const termsError = $("#termsError");
const successMessage = $("#successMessage");

// Regex rules
const nameRegex = /^[A-Za-z\s]{2,}$/; // letters & spaces, min 2
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // simple robust
const phoneRegex = /^\d{7,15}$/; // 7–15 digits
const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/; // 8+, Aa1!

// Password strength UI
const pwBar = $("#pwBar");
const pwLabel = $("#pwLabel");
const ruleLen = $("#ruleLen");
const ruleLow = $("#ruleLow");
const ruleUp = $("#ruleUp");
const ruleNum = $("#ruleNum");
const ruleSpec = $("#ruleSpec");

function markRule(el, ok) {
  el.classList.toggle("valid", ok);
  el.classList.toggle("invalid", !ok);
}
function passwordStrength(pw) {
  let score = 0;
  const hasLen = pw.length >= 8;
  const hasLow = /[a-z]/.test(pw);
  const hasUp = /[A-Z]/.test(pw);
  const hasNum = /\d/.test(pw);
  const hasSpec = /[\W_]/.test(pw);
  [
    markRule(ruleLen, hasLen),
    markRule(ruleLow, hasLow),
    markRule(ruleUp, hasUp),
    markRule(ruleNum, hasNum),
    markRule(ruleSpec, hasSpec),
  ];
  score = [hasLen, hasLow, hasUp, hasNum, hasSpec].filter(Boolean).length;
  const percent = (score / 5) * 100;
  pwBar.style.setProperty("--w", percent + "%");
  pwBar.style.setProperty(
    "--c",
    percent < 40 ? "#ef4444" : percent < 80 ? "#f59e0b" : "#22c55e"
  );
  pwBar.style.setProperty("--shadow", "none");
  // animate bar using ::after width:
  pwBar.style.setProperty("--width", percent + "%");
  pwBar.style.position = "relative";
  pwBar.style.setProperty("--val", percent);

  // update pseudo (fallback by manipulating ::after width via inline style):
  pwBar.style.setProperty("clip-path", "inset(0 round 999px)"); // harmless trick to ensure repaint
  pwBar.style.setProperty("--percent", percent + "%"); // decorative

  // label
  pwLabel.textContent =
    "Strength: " + (percent < 40 ? "Weak" : percent < 80 ? "Medium" : "Strong");
  // Also update actual bar via width on ::after replacement:
  pwBar.style.setProperty("--p", percent + "%");
  pwBar.style.setProperty(
    "--bglinear",
    "linear-gradient(90deg, #ef4444, #f59e0b, #22c55e)"
  );
  // We can't style ::after width from JS directly; instead, use width change below:
  pwBar.querySelector?.(":after"); // no-op
  // Workaround: set width using inline style injected element (simple fallback done below)
}
// simple fallback: directly set width of ::after using inline style on a child bar element
// Add a child bar once:
if (!pwBar.firstElementChild) {
  const span = document.createElement("span");
  span.style.display = "block";
  span.style.height = "100%";
  span.style.width = "0%";
  span.style.borderRadius = "999px";
  span.style.background = "linear-gradient(90deg, #ef4444, #f59e0b, #22c55e)";
  span.id = "pwInner";
  pwBar.appendChild(span);
}
function updatePwInner(percent) {
  $("#pwInner").style.width = percent + "%";
}

// Individual field validators
function validateName() {
  const val = nameField.value.trim();
  const ok = nameRegex.test(val);
  nameError.textContent = ok ? "" : "Name must be letters/spaces (min 2).";
  toggleValidState(nameField, ok);
  return ok;
}
function validateEmail() {
  const val = emailField.value.trim();
  const ok = emailRegex.test(val);
  emailError.textContent = ok
    ? ""
    : "Enter a valid email (e.g., jane@example.com).";
  toggleValidState(emailField, ok);
  return ok;
}
function validatePhone() {
  const val = phoneField.value.trim();
  const ok = phoneRegex.test(val);
  phoneError.textContent = ok
    ? ""
    : "Phone must be 7–15 digits (numbers only).";
  toggleValidState(phoneField, ok);
  return ok;
}
function validatePassword() {
  const pw = passwordField.value;
  const ok = pwRegex.test(pw);
  passwordError.textContent = ok
    ? ""
    : "Use ≥8 chars with uppercase, lowercase, number, and special character.";
  toggleValidState(passwordField, ok);
  const hasLen = pw.length >= 8;
  const hasLow = /[a-z]/.test(pw);
  const hasUp = /[A-Z]/.test(pw);
  const hasNum = /\d/.test(pw);
  const hasSpec = /[\W_]/.test(pw);
  const percent =
    ([hasLen, hasLow, hasUp, hasNum, hasSpec].filter(Boolean).length / 5) * 100;
  passwordStrength(pw);
  updatePwInner(percent);
  validateConfirm(); // keep confirm in sync
  return ok;
}
function validateConfirm() {
  const ok =
    confirmField.value.length > 0 && confirmField.value === passwordField.value;
  confirmError.textContent = ok ? "" : "Passwords must match.";
  toggleValidState(confirmField, ok);
  return ok;
}
function validateTerms() {
  const ok = terms.checked;
  termsError.textContent = ok ? "" : "You must accept the terms.";
  return ok;
}

function toggleValidState(input, ok) {
  input.style.borderColor = ok ? "var(--success)" : "var(--danger)";
}

// Live validation
[nameField, emailField, phoneField, passwordField, confirmField].forEach(
  (el) => {
    el.addEventListener("input", () => {
      if (el === nameField) validateName();
      if (el === emailField) validateEmail();
      if (el === phoneField) validatePhone();
      if (el === passwordField) validatePassword();
      if (el === confirmField) validateConfirm();
      updateSubmitState();
    });
  }
);

// Show/Hide password
$("#togglePassword").addEventListener("click", () => {
  const type = passwordField.type === "password" ? "text" : "password";
  passwordField.type = type;
  $("#togglePassword").textContent =
    type === "password" ? "👁️ Show" : "🙈 Hide";
});

// Keyboard UX: Enter in name -> focus email; in email -> phone; etc.
nameField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") emailField.focus();
});
emailField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") phoneField.focus();
});
phoneField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") passwordField.focus();
});

// Form submit
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const ok = [
    validateName(),
    validateEmail(),
    validatePhone(),
    validatePassword(),
    validateConfirm(),
    validateTerms(),
  ].every(Boolean);

  if (!ok) {
    successMessage.textContent = "";
    showToast("Fix validation errors ❌");
    return;
  }

  successMessage.textContent = "✅ Form submitted successfully!";
  form.reset();
  // reset visuals
  [nameField, emailField, phoneField, passwordField, confirmField].forEach(
    (i) => (i.style.borderColor = "var(--border)")
  );
  passwordStrength("");
  updatePwInner(0);
  updateSubmitState();
  showToast("Submitted 🎉");
});

// Disable submit until valid
function updateSubmitState() {
  const ok =
    validateName() &&
    validateEmail() &&
    validatePhone() &&
    pwRegex.test(passwordField.value) &&
    validateConfirm() &&
    terms.checked;
  submitBtn.disabled = !ok;
  submitBtn.style.opacity = ok ? "1" : ".7";
}
updateSubmitState();
terms.addEventListener("change", updateSubmitState);

// Initialize pw meter state
passwordStrength("");
updatePwInner(0);
