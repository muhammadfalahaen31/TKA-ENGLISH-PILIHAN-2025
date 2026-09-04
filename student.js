// ==========================================================================
// LATIHAN TKA BAHASA INGGRIS SMA 2025 PILIHAN
// STUDENT MODE JAVASCRIPT ENGINE (student.js)
// 100% Offline, Touch-Safe, Mobile-First, SafeStorage & Self-Correction Enabled
// ==========================================================================

const STUDENT_STORAGE_KEY = 'tka_english_2025_pilihan_student_v2';
const THEME_KEY = 'tka_english_2025_theme';

// SafeStorage Wrapper with in-memory fallback for file:// and sandboxes
window._memoryStorage = window._memoryStorage || {};
const SafeStorage = {
  getItem(key) {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      console.warn('LocalStorage read blocked; using in-memory store', e);
    }
    return window._memoryStorage[key] || null;
  },
  setItem(key, val) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, val);
      }
    } catch (e) {
      console.warn('LocalStorage write blocked; saving in-memory', e);
    }
    window._memoryStorage[key] = String(val);
  },
  removeItem(key) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('LocalStorage remove blocked', e);
    }
    delete window._memoryStorage[key];
  }
};
window.SafeStorage = SafeStorage;

// Application State
const StudentState = {
  currentView: 'dashboard', // 'dashboard', 'student_workspace', 'vocab_lab', 'tka_strategy', 'worksheet_summary'
  selectedTextId: 1, // 1 to 6
  currentQuestionIndex: 0, // 0 to 29

  // Student Identity
  profile: {
    name: '',
    class: '',
    school: 'SMA Plus PGRI Cibinong',
    teacher: 'Muhammad Falahaen Jiddan, M.Pd. Gr.'
  },

  // Student Answers & Reasons: { [qId]: { answer: any, reason: string, timestamp: number } }
  answers: {},

  // Student Manual Self-Evaluations in Summary View: { [qId]: 'correct' | 'incorrect' }
  evaluations: {},

  // Mobile Switcher
  mobileActiveTab: 'read', // 'read' or 'quiz'

  // Typography
  fontSizeLevel: 0, // -1 (sm), 0 (normal), 1 (md), 2 (lg)
  fontFamily: 'serif', // 'serif' or 'sans'
  theme: 'light',

  // Vocab Lab state
  vocabFilter: 'all',
  vocabActivity: 'flipcard',
  matchingState: { selectedLeft: null, selectedRight: null, matchedPairs: [] },
  contextQuizState: { currentIndex: 0, score: 0, answered: false, questions: [] },
  vocabSearchQuery: ''
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initStudentApp();
});

function initStudentApp() {
  loadStudentTheme();
  loadStudentData();
  setupStudentEvents();
  renderStudentApp();
}

function loadStudentTheme() {
  const savedTheme = SafeStorage.getItem(THEME_KEY) || 'light';
  StudentState.theme = savedTheme;
  applyStudentTheme(savedTheme);
}

function toggleStudentTheme() {
  StudentState.theme = StudentState.theme === 'light' ? 'dark' : 'light';
  SafeStorage.setItem(THEME_KEY, StudentState.theme);
  applyStudentTheme(StudentState.theme);
}

function applyStudentTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');
  if (icon && label) {
    if (theme === 'dark') {
      icon.textContent = '☀️';
      label.textContent = 'Light';
    } else {
      icon.textContent = '🌙';
      label.textContent = 'Dark';
    }
  }
}

function loadStudentData() {
  try {
    const raw = SafeStorage.getItem(STUDENT_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.profile) StudentState.profile = { ...StudentState.profile, ...data.profile };
      if (data.answers) StudentState.answers = data.answers;
      if (data.evaluations) StudentState.evaluations = data.evaluations;
      if (typeof data.fontSizeLevel === 'number') StudentState.fontSizeLevel = data.fontSizeLevel;
      if (data.fontFamily) StudentState.fontFamily = data.fontFamily;
    }
  } catch (e) {
    console.warn('Error loading student data from SafeStorage:', e);
  }

  // Populate profile inputs if available
  const nameInput = document.getElementById('input-student-name');
  const classInput = document.getElementById('input-student-class');
  const schoolInput = document.getElementById('input-student-school');
  const teacherInput = document.getElementById('input-student-teacher');

  if (nameInput) nameInput.value = StudentState.profile.name || '';
  if (classInput) classInput.value = StudentState.profile.class || '';
  if (schoolInput) schoolInput.value = StudentState.profile.school || 'SMA Plus PGRI Cibinong';
  if (teacherInput) teacherInput.value = StudentState.profile.teacher || 'Muhammad Falahaen Jiddan, M.Pd. Gr.';
}

function saveStudentData() {
  try {
    const dataToSave = {
      profile: StudentState.profile,
      answers: StudentState.answers,
      evaluations: StudentState.evaluations,
      fontSizeLevel: StudentState.fontSizeLevel,
      fontFamily: StudentState.fontFamily,
      updatedAt: Date.now()
    };
    SafeStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.warn('Error saving student data to SafeStorage:', e);
  }
}

function saveStudentProfile() {
  const nameInput = document.getElementById('input-student-name');
  const classInput = document.getElementById('input-student-class');
  const schoolInput = document.getElementById('input-student-school');
  const teacherInput = document.getElementById('input-student-teacher');

  if (nameInput) StudentState.profile.name = nameInput.value.trim();
  if (classInput) StudentState.profile.class = classInput.value.trim();
  if (schoolInput) StudentState.profile.school = schoolInput.value.trim();
  if (teacherInput) StudentState.profile.teacher = teacherInput.value.trim();

  saveStudentData();
  showStudentToast('✅ Student Profile Saved!');
}

function setupStudentEvents() {
  // Global shortcut or resize handlers if needed
}

// ==========================================
// VIEW SWITCHING
// ==========================================
function setStudentView(viewName) {
  StudentState.currentView = viewName;

  // Update navbar active state
  document.querySelectorAll('.navbar .nav-item').forEach(item => {
    if (item.getAttribute('data-view') === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update mobile bottom nav active state
  document.querySelectorAll('.mobile-bottom-nav .bottom-nav-item').forEach(item => {
    if (item.getAttribute('data-view') === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Show target section
  document.querySelectorAll('.main-view .view-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const target = document.getElementById(`view-${viewName}`);
  if (target) {
    target.classList.add('active');
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Render specific view contents
  if (viewName === 'dashboard') {
    renderStudentDashboard();
  } else if (viewName === 'student_workspace') {
    renderStudentWorkspace();
  } else if (viewName === 'vocab_lab') {
    renderStudentVocabLab();
  } else if (viewName === 'tka_strategy') {
    renderStudentStrategy();
  } else if (viewName === 'worksheet_summary') {
    renderStudentSummary();
  }
}

function renderStudentApp() {
  renderStudentDashboard();
}

// ==========================================
// 1. DASHBOARD VIEW
// ==========================================
function renderStudentDashboard() {
  const answeredCount = Object.keys(StudentState.answers).filter(qId => {
    const rec = StudentState.answers[qId];
    return rec && rec.answer !== undefined && rec.answer !== null && rec.answer !== '' && (!Array.isArray(rec.answer) || rec.answer.length > 0);
  }).length;

  const reasonedCount = Object.keys(StudentState.answers).filter(qId => {
    const rec = StudentState.answers[qId];
    return rec && rec.reason && rec.reason.trim().length > 3;
  }).length;

  const totalQuestions = (typeof MASTER_QUESTIONS !== 'undefined' ? MASTER_QUESTIONS.length : 30);
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);

  const elAns = document.getElementById('student-stat-answered');
  const elRsn = document.getElementById('student-stat-reasoned');
  const elPrg = document.getElementById('student-stat-progress');

  if (elAns) elAns.textContent = `${answeredCount}/${totalQuestions}`;
  if (elRsn) elRsn.textContent = `${reasonedCount}/${totalQuestions}`;
  if (elPrg) elPrg.textContent = `${progressPct}%`;

  // Render Passages Grid
  const cardsContainer = document.getElementById('student-dashboard-cards');
  if (!cardsContainer || typeof PASSAGES === 'undefined') return;

  cardsContainer.innerHTML = '';
  PASSAGES.forEach(pass => {
    // Count questions for this text
    const textQuestions = MASTER_QUESTIONS.filter(q => q.textId === pass.id);
    const textAnswered = textQuestions.filter(q => {
      const rec = StudentState.answers[q.id];
      return rec && rec.answer !== undefined && rec.answer !== null && rec.answer !== '' && (!Array.isArray(rec.answer) || rec.answer.length > 0);
    }).length;

    const card = document.createElement('div');
    card.className = 'text-card';
    card.onclick = () => openStudentWorkspace(pass.number);

    card.innerHTML = `
      <div class="text-card-tag">READING TEXT 0${pass.number}</div>
      <h4 class="text-card-title">${pass.title}</h4>
      <p class="text-card-desc" style="font-size:0.88rem; color:var(--text-muted); line-height:1.5; margin-bottom:14px;">
        ${pass.text.split('\n')[0].substring(0, 130)}...
      </p>
      <div class="text-card-footer">
        <span class="text-card-progress">${textAnswered}/${textQuestions.length} Answered</span>
        <button class="btn btn-outline btn-sm">Start Worksheet →</button>
      </div>
    `;
    cardsContainer.appendChild(card);
  });
}

function openStudentWorkspace(textNumber) {
  StudentState.selectedTextId = textNumber;
  const targetTextId = `text-${textNumber}`;
  const firstQIndex = MASTER_QUESTIONS.findIndex(q => q.textId === targetTextId);
  if (firstQIndex !== -1) {
    StudentState.currentQuestionIndex = firstQIndex;
  }
  setStudentView('student_workspace');
}

// ==========================================
// 2. STUDENT WORKSPACE VIEW
// ==========================================
function renderStudentWorkspace() {
  const currentQ = MASTER_QUESTIONS[StudentState.currentQuestionIndex];
  if (!currentQ) return;

  const matchNum = currentQ.textId.match(/\d+/);
  if (matchNum) {
    StudentState.selectedTextId = parseInt(matchNum[0], 10);
  }

  const currentPassage = PASSAGES.find(p => p.id === currentQ.textId) || PASSAGES[0];

  // Title
  const wsTitle = document.getElementById('student-ws-title');
  if (wsTitle) {
    wsTitle.textContent = `Text ${currentPassage.number}: ${currentPassage.title}`;
  }

  // Reading Panel
  const rTitle = document.getElementById('student-reading-title');
  const rCitation = document.getElementById('student-reading-citation');
  const rContent = document.getElementById('student-reading-content');

  if (rTitle) rTitle.textContent = currentPassage.title;
  if (rCitation) rCitation.textContent = currentPassage.source || '';
  if (rContent) {
    const paragraphs = currentPassage.text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    rContent.innerHTML = paragraphs.map((p, idx) => `
      <div class="reading-paragraph">
        <span class="p-number">${idx + 1}</span>
        <span class="reading-text">${p.trim()}</span>
      </div>
    `).join('');
  }

  // Question Navigator
  renderStudentQNav();

  // Question Canvas
  renderStudentPracticeCanvas(currentQ);

  // Apply typography styles
  applyStudentTypography();
}

function renderStudentQNav() {
  const qNav = document.getElementById('student-practice-q-nav');
  if (!qNav) return;

  qNav.innerHTML = '';
  MASTER_QUESTIONS.forEach((q, idx) => {
    const btn = document.createElement('button');
    btn.className = 'q-pill';
    if (idx === StudentState.currentQuestionIndex) {
      btn.classList.add('active');
    }

    const rec = StudentState.answers[q.id];
    const isAnswered = rec && rec.answer !== undefined && rec.answer !== null && rec.answer !== '' && (!Array.isArray(rec.answer) || rec.answer.length > 0);
    if (isAnswered) {
      btn.classList.add('answered');
    }

    btn.textContent = q.id < 10 ? `0${q.id}` : `${q.id}`;
    btn.onclick = () => {
      StudentState.currentQuestionIndex = idx;
      renderStudentWorkspace();
    };
    qNav.appendChild(btn);
  });
}

function renderStudentPracticeCanvas(q) {
  const canvas = document.getElementById('student-practice-canvas');
  if (!canvas) return;

  const currentAnswerObj = StudentState.answers[q.id] || { answer: null, reason: '' };
  const studentAns = currentAnswerObj.answer;
  const studentReason = currentAnswerObj.reason || '';

  let interactionHtml = '';

  // TYPE 1: MULTIPLE CHOICE (Single)
  if (q.type === 'mc') {
    interactionHtml = `
      <div class="options-list">
        ${q.options.map(opt => {
          const isChecked = studentAns === opt.id;
          return `
            <label class="option-card ${isChecked ? 'selected' : ''}" onclick="selectStudentSingleAnswer(${q.id}, '${opt.id}')">
              <span class="opt-radio-circle">${isChecked ? '✓' : opt.id}</span>
              <span class="opt-text"><strong>${opt.id}.</strong> ${opt.text}</span>
            </label>
          `;
        }).join('')}
      </div>
    `;
  }
  // TYPE 2: MULTIPLE RESPONSE (Multiple Answers)
  else if (q.type === 'mcma') {
    const selectedArr = Array.isArray(studentAns) ? studentAns : [];
    interactionHtml = `

      <div class="options-list">
        ${q.options.map(opt => {
          const isChecked = selectedArr.includes(opt.id);
          return `
            <label class="option-card ${isChecked ? 'selected' : ''}" onclick="toggleStudentMultiAnswer(${q.id}, '${opt.id}')">
              <span class="opt-checkbox-box">${isChecked ? '✓' : ''}</span>
              <span class="opt-text"><strong>${opt.id}.</strong> ${opt.text}</span>
            </label>
          `;
        }).join('')}
      </div>
    `;
  }
  // TYPE 3: MATRIX / CATEGORIZATION GRID
  else if (q.type === 'matrix') {
    const headers = q.matrixHeaders || ['Statement', 'True', 'False'];
    const rows = q.matrixRows || [];
    const matrixAns = Array.isArray(studentAns) ? studentAns : new Array(rows.length).fill(null);

    interactionHtml = `

      <div style="overflow-x:auto;">
        <table class="interactive-table">
          <thead>
            <tr>
              <th>${headers[0]}</th>
              <th style="text-align:center; width:110px;">${headers[1]}</th>
              <th style="text-align:center; width:110px;">${headers[2]}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, rIdx) => {
              const selectedVal = matrixAns[rIdx];
              const h1 = headers[1];
              const h2 = headers[2];
              return `
                <tr>
                  <td><strong>${rIdx + 1}.</strong> ${row.text}</td>
                  <td style="text-align:center;">
                    <label class="table-choice-label">
                      <input type="radio" name="matrix_row_${q.id}_${rIdx}" value="${h1}" ${selectedVal === h1 ? 'checked' : ''} onchange="setStudentMatrixAnswer(${q.id}, ${rIdx}, '${h1}')">
                      ${h1}
                    </label>
                  </td>
                  <td style="text-align:center;">
                    <label class="table-choice-label">
                      <input type="radio" name="matrix_row_${q.id}_${rIdx}" value="${h2}" ${selectedVal === h2 ? 'checked' : ''} onchange="setStudentMatrixAnswer(${q.id}, ${rIdx}, '${h2}')">
                      ${h2}
                    </label>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  canvas.innerHTML = `
    <div class="question-header">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
        <span class="q-badge badge-blue">QUESTION 0${q.id < 10 ? '0' + q.id : q.id}</span>
        <span class="q-badge badge-amber">${formatStudentQType(q.type)}</span>
        ${q.hots ? '<span class="q-badge" style="background:#fee2e2; color:#dc2626; font-weight:800;">HOTS ANALYSIS</span>' : ''}
      </div>
      <div class="question-stem-text">
        ${q.prompt}
      </div>
    </div>

    ${interactionHtml}

    <!-- CRITICAL REASONING & EVIDENCE AREA -->
    <div class="reasoning-box-wrapper">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <label style="font-size:0.95rem; font-weight:900; color:var(--text-main);">
          ✍️ Textual Evidence & Critical Reasoning (Bukti Teks & Penalaran Kritis Siswa):
        </label>
      </div>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:10px; line-height:1.4;">
        Tuliskan bukti paragraf berapa dan kalimat pendukung, serta argumen logis mengapa Anda memilih jawaban di atas.
      </p>
      <textarea
        id="student-reason-input-${q.id}"
        class="student-reason-textarea"
        style="width:100%; min-height:90px; padding:12px 14px; border-radius:10px; border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-family:var(--font-sans); font-size:0.95rem; line-height:1.5; resize:vertical;"
        placeholder="Contoh: Berdasarkan Paragraf 2 kalimat ke-1 yang menyatakan bahwa... Oleh karena itu opsi ini paling tepat karena..."
        oninput="handleStudentReasonInput(${q.id}, this.value)"
      >${studentReason}</textarea>
    </div>

    <!-- WORKSPACE NAVIGATION BUTTONS -->
    <div style="margin-top:24px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
      <button class="btn btn-secondary" onclick="prevStudentQuestion()" ${StudentState.currentQuestionIndex === 0 ? 'disabled' : ''}>
        ◄ Previous Question
      </button>

      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" onclick="setStudentView('worksheet_summary')">
          📋 My Answer Sheet
        </button>
        <button class="btn btn-primary" onclick="nextStudentQuestion()">
          ${StudentState.currentQuestionIndex === MASTER_QUESTIONS.length - 1 ? 'Check Summary Sheet →' : 'Next Question ►'}
        </button>
      </div>
    </div>
  `;
}

function formatStudentQType(type) {
  if (type === 'mc') return 'Multiple Choice';
  if (type === 'mcma') return 'Multiple Response';
  if (type === 'matrix') return 'Categorization / Matrix';
  return type.toUpperCase();
}

// Option selection handlers
function selectStudentSingleAnswer(qId, optId) {
  if (!StudentState.answers[qId]) {
    StudentState.answers[qId] = { answer: optId, reason: '', timestamp: Date.now() };
  } else {
    StudentState.answers[qId].answer = optId;
    StudentState.answers[qId].timestamp = Date.now();
  }
  saveStudentData();
  renderStudentWorkspace();
  showStudentToast(`✅ Option ${optId} Selected`);
}

function toggleStudentMultiAnswer(qId, optId) {
  if (!StudentState.answers[qId]) {
    StudentState.answers[qId] = { answer: [optId], reason: '', timestamp: Date.now() };
  } else {
    let arr = Array.isArray(StudentState.answers[qId].answer) ? [...StudentState.answers[qId].answer] : [];
    if (arr.includes(optId)) {
      arr = arr.filter(item => item !== optId);
    } else {
      arr.push(optId);
    }
    StudentState.answers[qId].answer = arr;
    StudentState.answers[qId].timestamp = Date.now();
  }
  saveStudentData();
  renderStudentWorkspace();
}

function setStudentMatrixAnswer(qId, rIdx, val) {
  const q = MASTER_QUESTIONS.find(item => item.id === qId);
  const rowCount = q && q.matrixRows ? q.matrixRows.length : 2;

  if (!StudentState.answers[qId]) {
    StudentState.answers[qId] = { answer: new Array(rowCount).fill(null), reason: '', timestamp: Date.now() };
  }
  if (!Array.isArray(StudentState.answers[qId].answer)) {
    StudentState.answers[qId].answer = new Array(rowCount).fill(null);
  }
  StudentState.answers[qId].answer[rIdx] = val;
  StudentState.answers[qId].timestamp = Date.now();
  saveStudentData();
  renderStudentQNav();
}

function handleStudentReasonInput(qId, text) {
  if (!StudentState.answers[qId]) {
    StudentState.answers[qId] = { answer: null, reason: text, timestamp: Date.now() };
  } else {
    StudentState.answers[qId].reason = text;
    StudentState.answers[qId].timestamp = Date.now();
  }
  saveStudentData();
}

function prevStudentQuestion() {
  if (StudentState.currentQuestionIndex > 0) {
    StudentState.currentQuestionIndex--;
    renderStudentWorkspace();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function nextStudentQuestion() {
  if (StudentState.currentQuestionIndex < MASTER_QUESTIONS.length - 1) {
    StudentState.currentQuestionIndex++;
    renderStudentWorkspace();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    setStudentView('worksheet_summary');
  }
}

// Mobile Tab switcher: read vs quiz
function setMobileViewTab(tab) {
  StudentState.mobileActiveTab = tab;
  const btnRead = document.getElementById('btn-mobile-read');
  const btnQuiz = document.getElementById('btn-mobile-quiz');
  const readPanel = document.getElementById('student-reading-panel');
  const quizPanel = document.getElementById('student-practice-panel');

  if (tab === 'read') {
    btnRead.classList.add('active');
    btnQuiz.classList.remove('active');
    if (readPanel) readPanel.style.display = 'block';
    if (quizPanel) quizPanel.style.display = 'none';
  } else {
    btnQuiz.classList.add('active');
    btnRead.classList.remove('active');
    if (quizPanel) quizPanel.style.display = 'block';
    if (readPanel) readPanel.style.display = 'none';
  }
}

// Typography Controls
function changeStudentFontSize(delta) {
  if (delta === 0) {
    StudentState.fontSizeLevel = 0;
  } else {
    StudentState.fontSizeLevel = Math.max(-1, Math.min(2, StudentState.fontSizeLevel + delta));
  }
  saveStudentData();
  applyStudentTypography();
  showStudentToast(`🔍 Font Size: ${StudentState.fontSizeLevel === -1 ? 'Small' : StudentState.fontSizeLevel === 0 ? 'Default' : StudentState.fontSizeLevel === 1 ? 'Large' : 'Extra Large'}`);
}

function toggleStudentFontFamily() {
  StudentState.fontFamily = StudentState.fontFamily === 'serif' ? 'sans' : 'serif';
  saveStudentData();
  applyStudentTypography();
  showStudentToast(`🔤 Font Family: ${StudentState.fontFamily === 'serif' ? 'Merriweather (Serif)' : 'Inter (Sans-Serif)'}`);
}

function applyStudentTypography() {
  const readPanel = document.getElementById('student-reading-panel');
  const fontLabel = document.getElementById('student-font-label');

  if (fontLabel) {
    fontLabel.textContent = StudentState.fontFamily === 'serif' ? 'Serif' : 'Sans';
  }

  if (readPanel) {
    readPanel.classList.remove('font-serif', 'font-sans', 'size-sm', 'size-normal', 'size-md', 'size-lg');
    readPanel.classList.add(StudentState.fontFamily === 'serif' ? 'font-serif' : 'font-sans');

    if (StudentState.fontSizeLevel === -1) readPanel.classList.add('size-sm');
    else if (StudentState.fontSizeLevel === 0) readPanel.classList.add('size-normal');
    else if (StudentState.fontSizeLevel === 1) readPanel.classList.add('size-md');
    else if (StudentState.fontSizeLevel === 2) readPanel.classList.add('size-lg');
  }
}

// Floating Peek Passage Bottom Sheet
function openPeekModal() {
  const currentQ = MASTER_QUESTIONS[StudentState.currentQuestionIndex];
  if (!currentQ) return;

  const pass = PASSAGES.find(p => p.id === currentQ.textId) || PASSAGES[0];
  const title = document.getElementById('peek-sheet-title');
  const body = document.getElementById('peek-sheet-body');
  const overlay = document.getElementById('peek-sheet-overlay');

  if (title) title.textContent = `Text ${pass.number}: ${pass.title}`;
  if (body) {
    const paragraphs = pass.text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    body.innerHTML = paragraphs.map((p, idx) => `
      <div class="reading-paragraph" style="margin-bottom:14px;">
        <span class="p-number" style="position:static; display:inline-block; margin-right:6px;">${idx + 1}</span>
        <span class="reading-text" style="line-height:1.6; font-size:0.98rem;">${p.trim()}</span>
      </div>
    `).join('');
  }

  if (overlay) overlay.classList.add('open');
}

function closePeekModal() {
  const overlay = document.getElementById('peek-sheet-overlay');
  if (overlay) overlay.classList.remove('open');
}

// ==========================================
// 3. VOCABULARY LAB (STUDENT VIEW)
// ==========================================
function renderStudentVocabLab() {
  const container = document.getElementById('student-vocab-content-area');
  if (!container || typeof VOCABULARY === 'undefined') return;

  const currentFilter = StudentState.vocabFilter;
  const currentMode = StudentState.vocabActivity;

  // Filter Vocabulary List
  let filteredVocab = [...VOCABULARY];
  if (currentFilter !== 'all') {
    const targetTextId = `text-${currentFilter}`;
    filteredVocab = filteredVocab.filter(v => v.textId === targetTextId);
  }

  if (StudentState.vocabSearchQuery && StudentState.vocabSearchQuery.trim().length > 0) {
    const q = StudentState.vocabSearchQuery.toLowerCase();
    filteredVocab = filteredVocab.filter(v =>
      v.word.toLowerCase().includes(q) ||
      v.arti.toLowerCase().includes(q) ||
      (v.contextualMeaning && v.contextualMeaning.toLowerCase().includes(q))
    );
  }

  if (currentMode === 'flipcard') {
    renderVocabFlipCards(container, filteredVocab);
  } else if (currentMode === 'matching') {
    renderVocabMatchingGame(container, filteredVocab);
  } else if (currentMode === 'context') {
    renderVocabContextChallenge(container, filteredVocab);
  } else if (currentMode === 'list') {
    renderVocabMasterTable(container, filteredVocab);
  }
}

function filterStudentVocab(filterVal) {
  StudentState.vocabFilter = String(filterVal);
  document.querySelectorAll('.vocab-filter-pill').forEach(pill => {
    if (pill.getAttribute('data-textfilter') === String(filterVal)) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
  renderStudentVocabLab();
}

function setStudentVocabActivity(mode) {
  StudentState.vocabActivity = mode;
  document.querySelectorAll('.vocab-mode-btn').forEach(btn => {
    if (btn.getAttribute('data-mode') === mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderStudentVocabLab();
}

// Mode 1: 3D Flip Cards
function renderVocabFlipCards(container, list) {
  if (list.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">No vocabulary found for this filter.</div>`;
    return;
  }

  container.innerHTML = `
    <div style="margin:16px 0 10px 0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div style="font-size:0.95rem; color:var(--text-muted);">
        Displaying <strong>${list.length}</strong> specialized terms. Tap card to flip. Click 🔊 to hear native pronunciation.
      </div>
    </div>
    <div class="flip-cards-grid">
      ${list.map(v => `
        <div class="flip-card-wrapper">
          <div class="flip-card-inner" onclick="toggleCardFlip(this)">
            
            <!-- FRONT CARD -->
            <div class="flip-card-front">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span class="vocab-pos-badge">${v.pos || 'Term'}</span>
                  <button class="btn-tts-speaker" onclick="event.stopPropagation(); speakStudentWord('${v.word.replace(/'/g, "\\'")}', this);" title="Pronounce Word">
                    🔊 Pronounce
                  </button>
                </div>
                <h3 class="flip-card-word">${v.word}</h3>
                <div class="flip-card-phonetic">${v.phonetic || ''}</div>
              </div>

              <div>
                <div class="flip-hint-badge">
                  💡 Tap to Flip Meaning & Context ↻
                </div>
              </div>
            </div>

            <!-- BACK CARD -->
            <div class="flip-card-back">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                  <span class="vocab-pos-badge" style="background:#dcfce7; color:#166534;">DEFINISI & KONTEKS</span>
                  <button class="btn-tts-speaker" onclick="event.stopPropagation(); speakStudentWord('${v.word.replace(/'/g, "\\'")}', this);">
                    🔊 Listen
                  </button>
                </div>
                <div style="font-size:1.15rem; font-weight:800; color:var(--text-main); margin-bottom:8px; line-height:1.4;">
                  ${v.arti}
                </div>
                <div style="font-size:0.88rem; color:var(--text-secondary); background:var(--bg-card); padding:8px 12px; border-radius:8px; margin-bottom:8px; line-height:1.4;">
                  <strong>Makna Kontekstual:</strong> ${v.contextualMeaning || v.simpleMeaning}
                </div>
                <div style="font-size:0.82rem; color:var(--text-muted); font-style:italic; line-height:1.4;">
                  "${v.sentence || ''}"
                </div>
              </div>

              <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; color:var(--text-muted);">
                <span>📌 ${v.relatedQuestion || 'Wacana TKA'}</span>
                <span style="font-weight:700; color:var(--academic-blue);">Tap to Flip Back ↻</span>
              </div>
            </div>

          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function toggleCardFlip(el) {
  el.classList.toggle('flipped');
}

// Mode 2: Match Words Game
function renderVocabMatchingGame(container, list) {
  const sample = [...list].sort(() => 0.5 - Math.random()).slice(0, 6);
  if (sample.length < 3) {
    container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">Need at least 3 terms to play matching game. Please select 'All Passages'.</div>`;
    return;
  }

  const leftItems = sample.map(v => ({ id: v.id, word: v.word })).sort(() => 0.5 - Math.random());
  const rightItems = sample.map(v => ({ id: v.id, arti: v.arti })).sort(() => 0.5 - Math.random());

  StudentState.matchingState = {
    selectedLeft: null,
    selectedRight: null,
    matchedPairs: []
  };

  container.innerHTML = `
    <div style="background:var(--bg-card); border-radius:16px; padding:24px; border:1px solid var(--border-color); margin-top:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
        <div>
          <h3 style="font-size:1.3rem; font-weight:900; color:var(--text-main);">🧩 Match Specialized Terms with Indonesian Meanings</h3>
          <p style="font-size:0.92rem; color:var(--text-muted);">Select one English term on the left, then click its corresponding definition on the right.</p>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="renderStudentVocabLab()">🔄 New Round</button>
      </div>

      <div class="matching-grid-container" style="display:grid; grid-template-columns:1fr 1fr; gap:18px;">
        <!-- Left column -->
        <div id="matching-left-col" style="display:flex; flex-direction:column; gap:12px;">
          ${leftItems.map(item => `
            <div class="match-card match-left" data-id="${item.id}" onclick="handleMatchSelect('left', ${item.id})" style="background:var(--bg-card-alt); padding:14px 18px; border-radius:12px; border:1.5px solid var(--border-color); font-weight:800; font-size:1rem; cursor:pointer; transition:all 0.2s ease;">
              ${item.word}
            </div>
          `).join('')}
        </div>

        <!-- Right column -->
        <div id="matching-right-col" style="display:flex; flex-direction:column; gap:12px;">
          ${rightItems.map(item => `
            <div class="match-card match-right" data-id="${item.id}" onclick="handleMatchSelect('right', ${item.id})" style="background:var(--bg-card-alt); padding:14px 18px; border-radius:12px; border:1.5px solid var(--border-color); font-weight:600; font-size:0.92rem; cursor:pointer; line-height:1.4; transition:all 0.2s ease;">
              ${item.arti}
            </div>
          `).join('')}
        </div>
      </div>

      <div id="matching-win-banner" style="display:none; margin-top:20px; text-align:center; padding:18px; background:#dcfce7; border-radius:12px; color:#166534; font-weight:900; font-size:1.1rem;">
        🎉 Awesome! All pairs matched correctly!
      </div>
    </div>
  `;
}

function handleMatchSelect(col, id) {
  const state = StudentState.matchingState;
  if (state.matchedPairs.includes(id)) return;

  if (col === 'left') {
    state.selectedLeft = id;
    document.querySelectorAll('.match-left').forEach(el => {
      if (parseInt(el.getAttribute('data-id'), 10) === id) {
        el.style.borderColor = 'var(--academic-blue)';
        el.style.background = 'var(--accent-cyan-light)';
      } else if (!state.matchedPairs.includes(parseInt(el.getAttribute('data-id'), 10))) {
        el.style.borderColor = 'var(--border-color)';
        el.style.background = 'var(--bg-card-alt)';
      }
    });
  } else if (col === 'right') {
    state.selectedRight = id;
    document.querySelectorAll('.match-right').forEach(el => {
      if (parseInt(el.getAttribute('data-id'), 10) === id) {
        el.style.borderColor = 'var(--academic-blue)';
        el.style.background = 'var(--accent-cyan-light)';
      } else if (!state.matchedPairs.includes(parseInt(el.getAttribute('data-id'), 10))) {
        el.style.borderColor = 'var(--border-color)';
        el.style.background = 'var(--bg-card-alt)';
      }
    });
  }

  // Check if both selected
  if (state.selectedLeft !== null && state.selectedRight !== null) {
    if (state.selectedLeft === state.selectedRight) {
      state.matchedPairs.push(state.selectedLeft);
      document.querySelectorAll(`[data-id="${state.selectedLeft}"]`).forEach(el => {
        el.style.background = '#dcfce7';
        el.style.borderColor = '#16a34a';
        el.style.color = '#166534';
      });
      showStudentToast('🎯 Correct Match!');
      if (state.matchedPairs.length === 6) {
        const win = document.getElementById('matching-win-banner');
        if (win) win.style.display = 'block';
      }
    } else {
      showStudentToast('❌ Incorrect Match, try again!');
      const leftEl = document.querySelector(`.match-left[data-id="${state.selectedLeft}"]`);
      const rightEl = document.querySelector(`.match-right[data-id="${state.selectedRight}"]`);
      if (leftEl) leftEl.style.borderColor = '#ef4444';
      if (rightEl) rightEl.style.borderColor = '#ef4444';

      setTimeout(() => {
        if (leftEl && !state.matchedPairs.includes(state.selectedLeft)) {
          leftEl.style.borderColor = 'var(--border-color)';
          leftEl.style.background = 'var(--bg-card-alt)';
        }
        if (rightEl && !state.matchedPairs.includes(state.selectedRight)) {
          rightEl.style.borderColor = 'var(--border-color)';
          rightEl.style.background = 'var(--bg-card-alt)';
        }
      }, 500);
    }
    state.selectedLeft = null;
    state.selectedRight = null;
  }
}

// Mode 3: Context Challenge
function renderVocabContextChallenge(container, list) {
  if (list.length < 4) {
    container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">Need more terms for context quiz. Please select 'All Passages'.</div>`;
    return;
  }

  const questions = [...list].sort(() => 0.5 - Math.random()).slice(0, 5).map(target => {
    const distractors = list.filter(v => v.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [target, ...distractors].sort(() => 0.5 - Math.random());
    return { target, options };
  });

  StudentState.contextQuizState = {
    currentIndex: 0,
    score: 0,
    answered: false,
    questions
  };

  renderCurrentContextQuizStep(container);
}

function renderCurrentContextQuizStep(container) {
  const state = StudentState.contextQuizState;
  const current = state.questions[state.currentIndex];
  if (!current) {
    container.innerHTML = `
      <div style="background:var(--bg-card); border-radius:16px; padding:36px; text-align:center; border:1px solid var(--border-color); margin-top:16px;">
        <h3 style="font-size:2rem; font-weight:900; color:var(--text-main); margin-bottom:12px;">🏆 Context Quiz Completed!</h3>
        <p style="font-size:1.15rem; color:var(--text-secondary); margin-bottom:24px;">
          You scored <strong>${state.score} / ${state.questions.length}</strong> in the Context Vocab Challenge!
        </p>
        <button class="btn btn-primary btn-lg" onclick="setStudentVocabActivity('context')">🔄 Play Again</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="background:var(--bg-card); border-radius:16px; padding:26px; border:1px solid var(--border-color); margin-top:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
        <span class="q-badge badge-blue">Question ${state.currentIndex + 1} of ${state.questions.length}</span>
        <span style="font-weight:900; color:var(--academic-blue); font-size:1.1rem;">Score: ${state.score}</span>
      </div>

      <div style="font-size:1.15rem; font-weight:800; color:var(--text-main); margin-bottom:12px;">
        Which term best matches the following meaning/context?
      </div>
      <div style="font-size:1.1rem; background:var(--bg-card-alt); padding:18px; border-radius:12px; border-left:5px solid var(--academic-blue); color:var(--text-main); margin-bottom:24px; line-height:1.5;">
        "${current.target.arti}"
        <div style="font-size:0.9rem; color:var(--text-muted); margin-top:8px;"><strong>Context:</strong> ${current.target.contextualMeaning || current.target.simpleMeaning}</div>
      </div>

      <div class="options-list">
        ${current.options.map(opt => `
          <div class="option-card" onclick="handleContextQuizSelect(${opt.id}, ${current.target.id})">
            <span class="vocab-pos-badge" style="font-size:0.75rem;">${opt.pos || 'Term'}</span>
            <span class="opt-text" style="font-weight:800; font-size:1.05rem; margin-left:8px;">${opt.word}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function handleContextQuizSelect(selectedId, targetId) {
  const state = StudentState.contextQuizState;
  if (selectedId === targetId) {
    state.score++;
    showStudentToast('🎉 Correct!');
  } else {
    showStudentToast('❌ Incorrect!');
  }
  state.currentIndex++;
  const container = document.getElementById('student-vocab-content-area');
  renderCurrentContextQuizStep(container);
}

// Mode 4: Searchable Word Master Table
function renderVocabMasterTable(container, list) {
  container.innerHTML = `
    <div style="background:var(--bg-card); border-radius:16px; padding:24px; border:1px solid var(--border-color); margin-top:16px;">
      <div style="margin-bottom:18px; display:flex; gap:12px; align-items:center;">
        <input
          type="text"
          id="input-vocab-search"
          placeholder="🔍 Search 90 specialized terms, definitions, phonetics..."
          style="width:100%; padding:12px 16px; border-radius:10px; border:1.5px solid var(--border-color); background:var(--bg-card-alt); color:var(--text-main); font-size:1rem;"
          value="${StudentState.vocabSearchQuery}"
          oninput="handleVocabSearch(this.value)"
        >
      </div>

      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.92rem;">
          <thead>
            <tr style="background:var(--bg-card-alt); text-align:left; border-bottom:2px solid var(--border-color);">
              <th style="padding:12px;">#</th>
              <th style="padding:12px;">English Term</th>
              <th style="padding:12px;">Phonetic & POS</th>
              <th style="padding:12px;">Arti (Indonesian)</th>
              <th style="padding:12px;">Context & Sentence</th>
              <th style="padding:12px; text-align:center;">Audio</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((v) => `
              <tr style="border-bottom:1px solid var(--border-color);">
                <td style="padding:12px; color:var(--text-muted); font-weight:700;">${v.id}</td>
                <td style="padding:12px; font-weight:900; color:var(--academic-blue); font-size:1.05rem;">${v.word}</td>
                <td style="padding:12px; color:var(--text-muted);"><small>${v.phonetic || ''}<br><em style="color:var(--text-secondary); font-weight:700;">${v.pos || ''}</em></small></td>
                <td style="padding:12px; color:var(--text-main); font-weight:700;">${v.arti}</td>
                <td style="padding:12px; color:var(--text-secondary); font-size:0.88rem; line-height:1.45;">
                  ${v.simpleMeaning || v.contextualMeaning}<br>
                  <em style="color:var(--text-muted);">"${v.sentence || ''}"</em>
                </td>
                <td style="padding:12px; text-align:center;">
                  <button class="btn-tts-speaker" onclick="speakStudentWord('${v.word.replace(/'/g, "\\'")}', this);">🔊</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function handleVocabSearch(val) {
  StudentState.vocabSearchQuery = val;
  renderStudentVocabLab();
}

function speakStudentWord(word, btnEl) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;

    if (btnEl) {
      btnEl.classList.add('speaking');
      utterance.onend = () => btnEl.classList.remove('speaking');
      utterance.onerror = () => btnEl.classList.remove('speaking');
    }

    window.speechSynthesis.speak(utterance);
  } else {
    showStudentToast('⚠️ Audio speech not supported on this browser');
  }
}

// ==========================================
// 4. STRATEGY GUIDE VIEW (IMPROVED)
// ==========================================
function renderStudentStrategy() {
  const container = document.getElementById('student-strategy-cards-container');
  if (!container || typeof STRATEGIES === 'undefined') return;

  container.innerHTML = '';
  STRATEGIES.forEach(strat => {
    const card = document.createElement('div');
    card.className = 'strategy-card-improved';
    card.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span class="strategy-badge-pill">${strat.category}</span>
          <span style="font-size:0.85rem; font-weight:800; color:var(--text-muted);">${strat.id.toUpperCase()}</span>
        </div>
        <h3 class="strategy-card-title">${strat.title}</h3>
        <p class="strategy-card-desc">${strat.shortExplanation}</p>

        <div class="strategy-steps-box" style="margin-top:16px;">
          <div class="strategy-steps-title">📋 Step-by-Step Method (Langkah Eksekusi):</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${strat.howToDo.map(step => `<div class="strategy-step-item">• ${step}</div>`).join('')}
          </div>
        </div>

        <div style="margin-top:12px; background:var(--accent-amber-light); border-radius:12px; padding:12px 16px; border:1px solid rgba(217, 119, 6, 0.3);">
          <div style="font-size:0.85rem; font-weight:900; color:var(--accent-amber); margin-bottom:4px;">💡 Quick Tip HOTS:</div>
          <div style="font-size:0.88rem; color:var(--text-secondary); line-height:1.4;">${strat.quickTip || strat.shortExplanation}</div>
        </div>

        <div class="strategy-trap-box" style="margin-top:10px;">
          <div style="font-size:0.85rem; font-weight:900; margin-bottom:4px;">⚠️ Distractor Trap Alert:</div>
          <div style="font-size:0.85rem; line-height:1.4;">${strat.trapAlert || 'Waspadai pilihan jawaban yang hanya mengulang kata kunci tanpa menjawab inti pertanyaan secara komprehensif.'}</div>
        </div>
      </div>

      <div style="margin-top:14px; padding-top:14px; border-top:1px solid var(--border-color);">
        <div style="font-size:0.82rem; font-weight:800; color:var(--text-muted); margin-bottom:8px;">Appears in Questions:</div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${(strat.appearsIn || []).map(qNum => `
            <button class="btn btn-outline btn-sm" onclick="goToQuestionFromStrategy(${qNum})">Q${qNum < 10 ? '0' + qNum : qNum}</button>
          `).join('')}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function goToQuestionFromStrategy(qNum) {
  StudentState.currentQuestionIndex = qNum - 1;
  setStudentView('student_workspace');
}

// ==========================================
// 5. WORKSHEET SUMMARY & SELF-EVALUATION
// ==========================================
function renderStudentSummary() {
  const container = document.getElementById('student-summary-container');
  if (!container || typeof MASTER_QUESTIONS === 'undefined') return;

  const total = MASTER_QUESTIONS.length;
  const answered = Object.keys(StudentState.answers).filter(qId => {
    const rec = StudentState.answers[qId];
    return rec && rec.answer !== undefined && rec.answer !== null && rec.answer !== '' && (!Array.isArray(rec.answer) || rec.answer.length > 0);
  }).length;

  const reasoned = Object.keys(StudentState.answers).filter(qId => {
    const rec = StudentState.answers[qId];
    return rec && rec.reason && rec.reason.trim().length > 3;
  }).length;

  const evals = StudentState.evaluations || {};
  const correctCount = Object.values(evals).filter(v => v === 'correct').length;
  const incorrectCount = Object.values(evals).filter(v => v === 'incorrect').length;
  const evaluatedCount = correctCount + incorrectCount;
  const scorePercent = evaluatedCount > 0 ? Math.round((correctCount / total) * 100) : 0;

  container.innerHTML = `
    <!-- Summary Header Card -->
    <div style="background:var(--bg-card); border-radius:16px; padding:26px; border:1px solid var(--border-color); margin-bottom:24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:18px;">
        <div>
          <span class="q-badge badge-blue">STUDENT REASONING WORKSHEET</span>
          <h2 style="font-size:1.75rem; font-weight:900; color:var(--text-main); margin-top:6px;">📋 My Complete Answer Sheet</h2>
          <p style="font-size:0.95rem; color:var(--text-muted);">
            Latihan TKA Bahasa Inggris SMA 2025 Pilihan • Rekapitulasi Bukti Teks & Evaluasi Mandiri Siswa
          </p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary btn-sm" onclick="printStudentWorksheet()">🖨️ Print / Save as PDF</button>
          <button class="btn btn-secondary btn-sm" onclick="setStudentView('dashboard')">← Dashboard</button>
        </div>
      </div>

      <!-- Student Profile Badge Box -->
      <div class="summary-profile-box" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; background:var(--bg-card-alt); padding:18px; border-radius:12px; border:1px solid var(--border-color); margin-bottom:20px;">
        <div><strong>Student Name:</strong> <span style="color:var(--academic-blue); font-weight:800;">${StudentState.profile.name || '(Not Filled)'}</span></div>
        <div><strong>Class / Group:</strong> <span style="color:var(--academic-blue); font-weight:800;">${StudentState.profile.class || '(Not Filled)'}</span></div>
        <div><strong>School:</strong> <span>${StudentState.profile.school || 'SMA Plus PGRI Cibinong'}</span></div>
        <div><strong>Advisor / Teacher:</strong> <span>${StudentState.profile.teacher || 'Muhammad Falahaen Jiddan, M.Pd. Gr.'}</span></div>
      </div>

      <!-- Live Self-Evaluation Scoreboard -->
      <div class="eval-score-card">
        <div>
          <div style="font-size:0.85rem; color:#94a3b8; font-weight:800; text-transform:uppercase;">Self-Correction Score:</div>
          <div style="font-size:2.2rem; font-weight:900; color:#38bdf8;">${correctCount} / ${total} <small style="font-size:1.1rem; color:#f1f5f9;">(${scorePercent}%)</small></div>
        </div>
        <div style="display:flex; gap:16px;">
          <div>
            <div style="font-size:0.82rem; color:#4ade80; font-weight:800;">✅ Correct</div>
            <div style="font-size:1.4rem; font-weight:900; color:#4ade80;">${correctCount}</div>
          </div>
          <div>
            <div style="font-size:0.82rem; color:#f87171; font-weight:800;">❌ Incorrect</div>
            <div style="font-size:1.4rem; font-weight:900; color:#f87171;">${incorrectCount}</div>
          </div>
          <div>
            <div style="font-size:0.82rem; color:#cbd5e1; font-weight:800;">⏳ Pending Evaluation</div>
            <div style="font-size:1.4rem; font-weight:900; color:#cbd5e1;">${total - evaluatedCount}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Questions Detailed List -->
    <div style="background:var(--bg-card); border-radius:16px; padding:24px; border:1px solid var(--border-color);">
      <h3 style="font-size:1.3rem; font-weight:900; color:var(--text-main); margin-bottom:18px;">
        📝 Detailed Question-by-Question Worksheet & Self-Correction:
      </h3>

      <div style="display:flex; flex-direction:column; gap:18px;">
        ${MASTER_QUESTIONS.map(q => {
          const ansRec = StudentState.answers[q.id] || { answer: null, reason: '' };
          const hasAns = ansRec.answer !== undefined && ansRec.answer !== null && ansRec.answer !== '' && (!Array.isArray(ansRec.answer) || ansRec.answer.length > 0);
          
          let displayAns = '<span style="color:var(--text-muted); font-style:italic;">[Belum Dijawab]</span>';
          if (hasAns) {
            if (q.type === 'mc') {
              displayAns = `<span class="badge badge-blue" style="font-size:0.92rem; font-weight:800;">Option: ${ansRec.answer}</span>`;
            } else if (q.type === 'mcma') {
              displayAns = `<span class="badge badge-blue" style="font-size:0.92rem; font-weight:800;">Options: ${Array.isArray(ansRec.answer) ? ansRec.answer.join(', ') : ansRec.answer}</span>`;
            } else if (q.type === 'matrix') {
              const rows = q.matrixRows || [];
              const arr = Array.isArray(ansRec.answer) ? ansRec.answer : [];
              displayAns = rows.map((r, i) => `<div><small><strong>${i + 1}.</strong> ${arr[i] ? arr[i] : '<em>(Belum dipilih)</em>'}</small></div>`).join('');
            }
          }

          const hasReason = ansRec.reason && ansRec.reason.trim().length > 0;
          const curEval = evals[q.id] || null;

          return `
            <div style="background:var(--bg-card-alt); border-radius:14px; padding:18px; border:1.5px solid var(--border-color);">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
                <div>
                  <span class="q-badge badge-blue">QUESTION 0${q.id < 10 ? '0' + q.id : q.id}</span>
                  <span style="font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-left:8px;">${q.textId.toUpperCase()} • ${formatStudentQType(q.type)}</span>
                </div>
                
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:0.82rem; font-weight:800; color:var(--text-muted);">Self-Correction:</span>
                  <div class="eval-btn-group">
                    <button class="btn-eval correct ${curEval === 'correct' ? 'active' : ''}" onclick="setQuestionEvaluation(${q.id}, 'correct')">
                      ✅ Correct
                    </button>
                    <button class="btn-eval incorrect ${curEval === 'incorrect' ? 'active' : ''}" onclick="setQuestionEvaluation(${q.id}, 'incorrect')">
                      ❌ Incorrect
                    </button>
                  </div>
                  <button class="btn btn-outline btn-sm" onclick="goToQuestionFromSummary(${q.id})" style="margin-left:4px;">✏️ Edit</button>
                </div>
              </div>

              <div style="font-weight:800; color:var(--text-main); font-size:1rem; margin-bottom:12px; line-height:1.4;">
                ${q.prompt}
              </div>

              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px;">
                <div style="background:var(--bg-card); padding:12px 16px; border-radius:10px; border:1px solid var(--border-color);">
                  <div style="font-size:0.82rem; font-weight:800; color:var(--text-muted); margin-bottom:6px; text-transform:uppercase;">Selected Answer:</div>
                  <div>${displayAns}</div>
                </div>

                <div style="background:var(--bg-card); padding:12px 16px; border-radius:10px; border:1px solid var(--border-color);">
                  <div style="font-size:0.82rem; font-weight:800; color:var(--text-muted); margin-bottom:6px; text-transform:uppercase;">Textual Evidence & Reasoning:</div>
                  <div style="font-size:0.92rem; color:var(--text-secondary); line-height:1.45;">
                    ${hasReason ? ansRec.reason : '<em style="color:var(--text-muted);">Tidak ada bukti teks atau penalaran yang dicatat.</em>'}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function setQuestionEvaluation(qId, status) {
  if (!StudentState.evaluations) StudentState.evaluations = {};
  if (StudentState.evaluations[qId] === status) {
    delete StudentState.evaluations[qId];
  } else {
    StudentState.evaluations[qId] = status;
  }
  saveStudentData();
  renderStudentSummary();
}

function goToQuestionFromSummary(qId) {
  const targetIndex = MASTER_QUESTIONS.findIndex(q => q.id === qId);
  if (targetIndex !== -1) {
    StudentState.currentQuestionIndex = targetIndex;
    setStudentView('student_workspace');
  }
}

function printStudentWorksheet() {
  window.print();
}

// ==========================================
// RESET MODAL
// ==========================================
function openStudentResetModal() {
  const modal = document.getElementById('student-reset-modal');
  if (modal) modal.classList.add('open');
}

function closeStudentModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

function confirmStudentReset() {
  StudentState.answers = {};
  StudentState.evaluations = {};
  SafeStorage.removeItem(STUDENT_STORAGE_KEY);
  closeStudentModal('student-reset-modal');
  showStudentToast('🔄 Worksheet successfully reset!');
  renderStudentApp();
}

// ==========================================
// TOAST NOTIFICATION
// ==========================================
function showStudentToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fadeout');
    setTimeout(() => toast.remove(), 400);
  }, 2200);
}
