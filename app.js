// ── STATE ──────────────────────────────────────────────────────────────
const KEY = 'cecilia_care_v1';

const DEFAULT = {
  patient: {
    name: 'Cecilia',
    cancer: 'Lymph node cancer (abdomen)',
    stage: '',
    doctor: 'Dr. Powell',
    hospital: "St Bartholomew's Hospital, City of London",
    treatment: '',
    diagnosed: ''
  },
  you: { name: 'Luis', email: 'luis.balseca.1@gmail.com' },
  siblings: [
    { name: 'Anita', email: 'adriana.balseca@gmail.com' },
    { name: 'Santi', email: 'Santi.balseca@googlemail.com' }
  ],
  appointments: [
    {
      id: 1747699200000,
      type: 'CT Scan',
      doctor: 'Dr. Powell',
      date: '2026-05-20',
      time: '09:00',
      hospital: "St Bartholomew's Hospital",
      ward: '',
      duration: 60,
      notes: ''
    }
  ],
  notes: [],
  medications: [
    { id: 1, name: 'Laxatives', dose: '', freq: 'As needed', prescribed: 'Dr. Powell', notes: '' }
  ],
  contacts: [
    { id: 1, name: "St Bartholomew's Hospital", phone: '020 3416 5000', email: '', cat: 'Hospital' },
    { id: 2, name: "Dr. Powell's Secretary", phone: '', email: '', cat: 'Hospital' }
  ]
};

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT));
}

function saveState() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

// ── INIT ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setDate();
  renderAll();
  populateSettingsForm();
});

function setDate() {
  const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  document.getElementById('today-date').textContent =
    new Date().toLocaleDateString('en-GB', opts);
}

function renderAll() {
  renderHero();
  renderStats();
  renderNextAppt();
  renderRecentNotes();
  renderApptList();
  renderNotesList();
  renderMedList();
  renderContactsList();
  renderSiblingList();
}

// ── NAVIGATION ─────────────────────────────────────────────────────────
function showPage(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (el) el.classList.add('active');
  const titles = {
    overview: 'Overview', appointments: 'Appointments', notes: 'My Notes',
    medications: 'Medications', contacts: 'Contacts', settings: 'Setup'
  };
  document.getElementById('page-title').textContent = titles[id] || id;
  closeSidebarOnMobile();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
}
function closeSidebarOnMobile() {
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
  }
}

// ── HERO / STATS ───────────────────────────────────────────────────────
function renderHero() {
  const p = state.patient;
  document.getElementById('hero-name').textContent = p.name || 'Cecilia';
  document.getElementById('hero-diagnosis').textContent =
    [p.cancer, p.stage].filter(Boolean).join(' · ') || 'Cancer treatment';
  document.getElementById('hero-doctor').textContent =
    [p.doctor, p.hospital].filter(Boolean).join(' · ') || '';
}

function renderStats() {
  const now = new Date(); now.setHours(0,0,0,0);
  const upcoming = state.appointments.filter(a => new Date(a.date) >= now).length;
  document.getElementById('stat-upcoming').textContent = upcoming;
  document.getElementById('stat-notes').textContent = state.notes.length;
  document.getElementById('stat-meds').textContent = state.medications.length;
}

// ── OVERVIEW ───────────────────────────────────────────────────────────
function renderNextAppt() {
  const now = new Date(); now.setHours(0,0,0,0);
  const upcoming = state.appointments
    .filter(a => new Date(a.date) >= now)
    .sort((a,b) => new Date(a.date) - new Date(b.date));
  const el = document.getElementById('next-appt-card');
  if (!upcoming.length) {
    el.innerHTML = '<div class="empty-state">No upcoming appointments.</div>';
    return;
  }
  el.innerHTML = apptCardHTML(upcoming[0]);
}

function renderRecentNotes() {
  const el = document.getElementById('recent-notes-list');
  if (!state.notes.length) {
    el.innerHTML = '<div class="empty-state">No notes yet.</div>';
    return;
  }
  const recent = [...state.notes].sort((a,b) => b.id - a.id).slice(0, 2);
  el.innerHTML = recent.map(n => noteItemHTML(n)).join('');
}

// ── APPOINTMENTS ───────────────────────────────────────────────────────
function addAppointment() {
  const type     = document.getElementById('a-type').value;
  const date     = document.getElementById('a-date').value;
  const time     = document.getElementById('a-time').value;
  const doctor   = document.getElementById('a-doctor').value.trim();
  const hospital = document.getElementById('a-hospital').value.trim() || state.patient.hospital;
  const ward     = document.getElementById('a-ward').value.trim();
  const duration = parseInt(document.getElementById('a-duration').value) || 60;
  const notes    = document.getElementById('a-notes').value.trim();

  if (!type) { showToast('Please select an appointment type.'); return; }
  if (!date) { showToast('Please enter a date.'); return; }

  const appt = { id: Date.now(), type, date, time, doctor, hospital, ward, duration, notes };
  state.appointments.push(appt);
  saveState();
  renderAll();

  ['a-type','a-date','a-time','a-doctor','a-hospital','a-ward','a-duration','a-notes']
    .forEach(id => { const el = document.getElementById(id); el.value = ''; });

  showToast('Appointment added ✓');
}

function deleteAppointment(id) {
  state.appointments = state.appointments.filter(a => a.id !== id);
  saveState();
  renderAll();
  showToast('Appointment removed.');
}

function renderApptList() {
  const el = document.getElementById('appt-list-full');
  if (!state.appointments.length) {
    el.innerHTML = '<div class="empty-state">No appointments added yet.</div>';
    return;
  }
  const sorted = [...state.appointments].sort((a,b) => new Date(a.date) - new Date(b.date));
  el.innerHTML = sorted.map(a => apptCardHTML(a, true)).join('');
}

function apptCardHTML(a, showDelete = false) {
  const d = new Date(a.date + 'T' + (a.time || '00:00'));
  const now = new Date(); now.setHours(0,0,0,0);
  const isPast = new Date(a.date) < now;
  const dateStr = d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
  const timeStr = a.time ? d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) : '';
  const badge = isPast
    ? '<span class="badge badge-grey">Past</span>'
    : '<span class="badge badge-green">Upcoming</span>';
  const deleteBtn = showDelete
    ? `<button class="btn-icon" onclick="deleteAppointment(${a.id})" title="Remove" aria-label="Delete appointment">✕</button>`
    : '';

  return `<div class="appt-item">
    <div class="item-icon">◷</div>
    <div class="item-body">
      <div class="item-title">${a.type}</div>
      <div class="item-meta">
        ${dateStr}${timeStr ? ' at ' + timeStr : ''} ${a.duration ? '· ' + a.duration + ' min' : ''}<br>
        ${a.hospital ? a.hospital : ''}${a.ward ? ' · ' + a.ward : ''}
        ${a.doctor ? '<br>' + a.doctor : ''}
        ${a.notes ? '<br><em>' + a.notes + '</em>' : ''}
      </div>
      <div style="margin-top:6px">${badge}</div>
    </div>
    <div class="item-actions">${deleteBtn}</div>
  </div>`;
}

// ── NOTES ──────────────────────────────────────────────────────────────
function saveNote() {
  const title = document.getElementById('note-title').value.trim();
  const body  = document.getElementById('note-body').value.trim();
  if (!body) { showToast('Please write something first.'); return; }

  const note = {
    id: Date.now(),
    title: title || 'Note',
    body,
    date: new Date().toISOString()
  };
  state.notes.unshift(note);
  saveState();
  renderAll();

  document.getElementById('note-title').value = '';
  document.getElementById('note-body').value  = '';
  showToast('Note saved ✓');
}

function deleteNote(id) {
  state.notes = state.notes.filter(n => n.id !== id);
  saveState();
  renderAll();
  showToast('Note deleted.');
}

function openNote(id) {
  const note = state.notes.find(n => n.id === id);
  if (!note) return;
  document.getElementById('note-title').value = note.title;
  document.getElementById('note-body').value  = note.body;
  showPage('notes', document.querySelectorAll('.nav-link')[2]);
  showToast('Note loaded for editing.');
}

function renderNotesList() {
  const el = document.getElementById('notes-list');
  if (!state.notes.length) {
    el.innerHTML = '<div class="empty-state">No notes yet — start writing above.</div>';
    return;
  }
  el.innerHTML = state.notes.map(n => noteItemHTML(n, true)).join('');
}

function noteItemHTML(n, showActions = false) {
  const d = new Date(n.date);
  const dateStr = d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  const timeStr = d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  const preview = n.body.replace(/\n/g,' ').slice(0, 80) + (n.body.length > 80 ? '…' : '');
  const actions = showActions ? `
    <div class="item-actions">
      <button class="btn-icon" onclick="openNote(${n.id})" title="Edit" aria-label="Edit note">✎</button>
      <button class="btn-icon" onclick="deleteNote(${n.id})" title="Delete" aria-label="Delete note">✕</button>
    </div>` : '';

  return `<div class="note-item" onclick="openNote(${n.id})">
    <div class="item-icon">✎</div>
    <div class="item-body">
      <div class="item-title">${n.title}</div>
      <div class="note-preview">${preview}</div>
      <div class="note-date">${dateStr} at ${timeStr}</div>
    </div>
    ${actions}
  </div>`;
}

// ── MEDICATIONS ────────────────────────────────────────────────────────
function addMedication() {
  const name = document.getElementById('m-name').value.trim();
  if (!name) { showToast('Please enter a medication name.'); return; }

  const med = {
    id: Date.now(),
    name,
    dose:       document.getElementById('m-dose').value.trim(),
    freq:       document.getElementById('m-freq').value,
    prescribed: document.getElementById('m-prescribed').value.trim(),
    notes:      document.getElementById('m-notes').value.trim()
  };
  state.medications.push(med);
  saveState();
  renderAll();
  ['m-name','m-dose','m-freq','m-prescribed','m-notes']
    .forEach(id => { document.getElementById(id).value = ''; });
  showToast('Medication added ✓');
}

function deleteMedication(id) {
  state.medications = state.medications.filter(m => m.id !== id);
  saveState();
  renderAll();
  showToast('Medication removed.');
}

function renderMedList() {
  const el = document.getElementById('med-list');
  if (!state.medications.length) {
    el.innerHTML = '<div class="empty-state">No medications added yet.</div>';
    return;
  }
  el.innerHTML = state.medications.map(m => `
    <div class="med-item">
      <div class="item-icon">◉</div>
      <div class="item-body">
        <div class="item-title">${m.name}${m.dose ? ' — ' + m.dose : ''}</div>
        <div class="item-meta">
          ${m.freq ? m.freq : ''}${m.prescribed ? ' · ' + m.prescribed : ''}
          ${m.notes ? '<br><em>' + m.notes + '</em>' : ''}
        </div>
      </div>
      <div class="item-actions">
        <button class="btn-icon" onclick="deleteMedication(${m.id})" title="Remove" aria-label="Remove medication">✕</button>
      </div>
    </div>`).join('');
}

// ── CONTACTS ───────────────────────────────────────────────────────────
function addContact() {
  const name = document.getElementById('c-name').value.trim();
  if (!name) { showToast('Please enter a name.'); return; }

  const contact = {
    id:    Date.now(),
    name,
    phone: document.getElementById('c-phone').value.trim(),
    email: document.getElementById('c-email').value.trim(),
    cat:   document.getElementById('c-cat').value
  };
  state.contacts.push(contact);
  saveState();
  renderContactsList();
  ['c-name','c-phone','c-email'].forEach(id => { document.getElementById(id).value = ''; });
  showToast('Contact added ✓');
}

function deleteContact(id) {
  state.contacts = state.contacts.filter(c => c.id !== id);
  saveState();
  renderContactsList();
  showToast('Contact removed.');
}

function renderContactsList() {
  const el = document.getElementById('contacts-list');
  if (!state.contacts.length) {
    el.innerHTML = '<div class="empty-state">No contacts added yet.</div>';
    return;
  }
  const catBadge = { Hospital: 'badge-rose', GP: 'badge-green', Family: 'badge-blue', Emergency: 'badge-rose', Other: 'badge-grey' };
  el.innerHTML = state.contacts.map(c => `
    <div class="contact-item">
      <div class="item-icon">◎</div>
      <div class="item-body">
        <div class="item-title">${c.name}</div>
        <div class="item-meta">
          ${c.phone ? `<a href="tel:${c.phone}" style="color:var(--rose);text-decoration:none">📞 ${c.phone}</a>` : ''}
          ${c.phone && c.email ? ' · ' : ''}
          ${c.email ? `<a href="mailto:${c.email}" style="color:var(--rose);text-decoration:none">✉ ${c.email}</a>` : ''}
        </div>
        <div style="margin-top:5px"><span class="badge ${catBadge[c.cat]||'badge-grey'}">${c.cat}</span></div>
      </div>
      <div class="item-actions">
        <button class="btn-icon" onclick="deleteContact(${c.id})" title="Remove" aria-label="Remove contact">✕</button>
      </div>
    </div>`).join('');
}

// ── SETTINGS ───────────────────────────────────────────────────────────
function populateSettingsForm() {
  const p = state.patient;
  document.getElementById('s-name').value      = p.name      || '';
  document.getElementById('s-cancer').value    = p.cancer    || '';
  document.getElementById('s-stage').value     = p.stage     || '';
  document.getElementById('s-doctor').value    = p.doctor    || '';
  document.getElementById('s-hospital').value  = p.hospital  || '';
  document.getElementById('s-treatment').value = p.treatment || '';
  document.getElementById('s-diagnosed').value = p.diagnosed || '';
  document.getElementById('s-you-name').value  = state.you.name  || '';
  document.getElementById('s-you-email').value = state.you.email || '';
  renderSiblingList();
}

function saveSettings() {
  state.patient = {
    name:      document.getElementById('s-name').value.trim(),
    cancer:    document.getElementById('s-cancer').value.trim(),
    stage:     document.getElementById('s-stage').value,
    doctor:    document.getElementById('s-doctor').value.trim(),
    hospital:  document.getElementById('s-hospital').value.trim(),
    treatment: document.getElementById('s-treatment').value,
    diagnosed: document.getElementById('s-diagnosed').value
  };
  saveState();
  renderHero();
  showToast('Details saved ✓');
}

function saveContacts() {
  state.you = {
    name:  document.getElementById('s-you-name').value.trim(),
    email: document.getElementById('s-you-email').value.trim()
  };
  saveState();
  showToast('Contacts saved ✓');
}

function addSibling() {
  const name  = document.getElementById('sib-name').value.trim();
  const email = document.getElementById('sib-email').value.trim();
  if (!email) { showToast('Please enter an email address.'); return; }
  state.siblings.push({ name: name || email, email });
  saveState();
  renderSiblingList();
  document.getElementById('sib-name').value  = '';
  document.getElementById('sib-email').value = '';
}

function removeSibling(idx) {
  state.siblings.splice(idx, 1);
  saveState();
  renderSiblingList();
}

function renderSiblingList() {
  const el = document.getElementById('sibling-list');
  el.innerHTML = state.siblings.map((s, i) => `
    <span class="sibling-tag">
      ${s.name} &lt;${s.email}&gt;
      <button onclick="removeSibling(${i})" aria-label="Remove ${s.name}">×</button>
    </span>`).join('');
}

// ── EXPORT ─────────────────────────────────────────────────────────────
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'cecilia-care-backup.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported ✓');
}

// ── TOAST ──────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
