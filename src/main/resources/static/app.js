const API = '/students';

// ── State ──────────────────────────────────────────────────────────────────
let students = [];
let deleteTargetId = null;

// ── DOM refs ───────────────────────────────────────────────────────────────
const tableBody     = document.getElementById('tableBody');
const emptyRow      = document.getElementById('emptyRow');
const totalCount    = document.getElementById('totalCount');
const visibleCount  = document.getElementById('visibleCount');
const courseCount   = document.getElementById('courseCount');
const searchInput   = document.getElementById('searchInput');
const modalOverlay  = document.getElementById('modalOverlay');
const deleteOverlay = document.getElementById('deleteOverlay');
const modal         = document.getElementById('modal');
const modalTitle    = document.getElementById('modalTitle');
const studentForm   = document.getElementById('studentForm');
const studentId     = document.getElementById('studentId');
const fieldName     = document.getElementById('fieldName');
const fieldEmail    = document.getElementById('fieldEmail');
const fieldCourse   = document.getElementById('fieldCourse');
const errName       = document.getElementById('errName');
const errEmail      = document.getElementById('errEmail');
const errCourse     = document.getElementById('errCourse');
const submitBtn     = document.getElementById('submitBtn');
const deleteName    = document.getElementById('deleteName');

// ── API helpers ────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: options.body ? { 'Content-Type': 'application/json' } : {},
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

// ── Load & render ──────────────────────────────────────────────────────────
async function loadStudents() {
  showShimmer();
  try {
    students = await apiFetch(API);
    renderTable(students);
  } catch (e) {
    toast('Failed to load students', 'error');
  }
}

function renderTable(list) {
  totalCount.textContent = `${students.length} Student${students.length !== 1 ? 's' : ''}`;
  visibleCount.textContent = `${list.length}`;
  courseCount.textContent = `${new Set(students.map(s => String(s.course || '').trim().toLowerCase()).filter(Boolean)).size}`;

  // remove all non-empty rows
  [...tableBody.querySelectorAll('tr:not(#emptyRow)')].forEach(r => r.remove());

  if (list.length === 0) {
    emptyRow.style.display = '';
    return;
  }
  emptyRow.style.display = 'none';

  list.forEach(s => {
    const tr = document.createElement('tr');
    tr.classList.add('row-enter');
    tr.dataset.id = s.id;
    tr.innerHTML = `
      <td><span class="id-badge">${s.id}</span></td>
      <td>
        <div class="name-cell">
          <div class="avatar">${initials(s.name)}</div>
          <span class="name-text">${esc(s.name)}</span>
        </div>
      </td>
      <td><span class="email-text">${esc(s.email)}</span></td>
      <td><span class="course-chip">${esc(s.course)}</span></td>
      <td>
        <div class="row-actions">
          <button class="btn btn-icon" type="button" data-action="edit" data-id="${s.id}" title="Edit student">✏️</button>
          <button class="btn btn-icon delete" type="button" data-action="delete" data-id="${s.id}" data-name="${escAttr(s.name)}" title="Delete student">🗑️</button>
        </div>
      </td>`;
    tableBody.appendChild(tr);
  });
}

function showShimmer() {
  [...tableBody.querySelectorAll('tr:not(#emptyRow)')].forEach(r => r.remove());
  emptyRow.style.display = 'none';
  for (let i = 0; i < 3; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="shimmer" style="width:30px"></div></td>
      <td><div class="shimmer" style="width:140px"></div></td>
      <td><div class="shimmer" style="width:180px"></div></td>
      <td><div class="shimmer" style="width:100px"></div></td>
      <td><div class="shimmer" style="width:60px;margin-left:auto"></div></td>`;
    tableBody.appendChild(tr);
  }
}

// ── Search ─────────────────────────────────────────────────────────────────
searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase().trim();
  const filtered = !q ? students : students.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.email.toLowerCase().includes(q) ||
    s.course.toLowerCase().includes(q)
  );
  renderTable(filtered);
});

tableBody.addEventListener('click', e => {
  const button = e.target.closest('button[data-action]');
  if (!button) return;
  const { action, id, name } = button.dataset;
  if (action === 'edit') openEdit(id);
  if (action === 'delete') openDelete(id, name);
});

// ── Add modal ──────────────────────────────────────────────────────────────
document.getElementById('openAddModal').addEventListener('click', () => {
  studentId.value = '';
  studentForm.reset();
  clearErrors();
  modalTitle.textContent = 'Add Student';
  submitBtn.textContent  = 'Save Student';
  openModal(modalOverlay);
});

document.getElementById('modalClose').addEventListener('click', () => closeModal(modalOverlay));
document.getElementById('cancelBtn').addEventListener('click', () => closeModal(modalOverlay));
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(modalOverlay); });

// ── Edit ───────────────────────────────────────────────────────────────────
async function openEdit(id) {
  try {
    const s = await apiFetch(`${API}/${id}`);
    studentId.value   = s.id;
    fieldName.value   = s.name;
    fieldEmail.value  = s.email;
    fieldCourse.value = s.course;
    clearErrors();
    modalTitle.textContent = 'Edit Student';
    submitBtn.textContent  = 'Update Student';
    openModal(modalOverlay);
  } catch (e) {
    toast(e.message, 'error');
  }
}

// ── Form submit ────────────────────────────────────────────────────────────
studentForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!validate()) return;

  const payload = {
    name:   fieldName.value.trim(),
    email:  fieldEmail.value.trim(),
    course: fieldCourse.value.trim(),
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving…';

  try {
    const id = studentId.value;
    if (id) {
      await apiFetch(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      toast('Student updated successfully', 'success');
    } else {
      await apiFetch(API, { method: 'POST', body: JSON.stringify(payload) });
      toast('Student added successfully', 'success');
    }
    closeModal(modalOverlay);
    await loadStudents();
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = studentId.value ? 'Update Student' : 'Save Student';
  }
});

// ── Delete ─────────────────────────────────────────────────────────────────
function openDelete(id, name) {
  deleteTargetId = id;
  deleteName.textContent = `"${name}" will be permanently removed.`;
  openModal(deleteOverlay);
}

document.getElementById('cancelDelete').addEventListener('click', () => closeModal(deleteOverlay));
deleteOverlay.addEventListener('click', e => { if (e.target === deleteOverlay) closeModal(deleteOverlay); });

document.getElementById('confirmDelete').addEventListener('click', async () => {
  try {
    await apiFetch(`${API}/${deleteTargetId}`, { method: 'DELETE' });
    toast('Student deleted', 'info');
    closeModal(deleteOverlay);
    await loadStudents();
  } catch (err) {
    toast(err.message, 'error');
  }
});

// ── Validation ─────────────────────────────────────────────────────────────
function validate() {
  clearErrors();
  let ok = true;
  if (!fieldName.value.trim())  { showError(fieldName,  errName,  'Name is required');  ok = false; }
  if (!fieldEmail.value.trim()) { showError(fieldEmail, errEmail, 'Email is required'); ok = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldEmail.value.trim())) {
    showError(fieldEmail, errEmail, 'Enter a valid email'); ok = false;
  }
  if (!fieldCourse.value.trim()) { showError(fieldCourse, errCourse, 'Course is required'); ok = false; }
  return ok;
}
function showError(input, span, msg) { input.classList.add('invalid'); span.textContent = msg; }
function clearErrors() {
  [fieldName, fieldEmail, fieldCourse].forEach(i => i.classList.remove('invalid'));
  [errName, errEmail, errCourse].forEach(s => s.textContent = '');
}

// ── Modal helpers ──────────────────────────────────────────────────────────
function openModal(overlay)  { overlay.classList.add('active'); }
function closeModal(overlay) { overlay.classList.remove('active'); }

// ── Toast ──────────────────────────────────────────────────────────────────
function toast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 320);
  }, 3200);
}

// ── Utilities ──────────────────────────────────────────────────────────────
function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(str) {
  return esc(str).replace(/'/g, '&#39;');
}
function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return ((parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '')).toUpperCase();
}

// ── Init ───────────────────────────────────────────────────────────────────
loadStudents();
