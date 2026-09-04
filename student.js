// ==========================================================================
// LATIHAN TKA BAHASA INGGRIS SMA 2025 PILIHAN
// STUDENT MODE JAVASCRIPT ENGINE (student.js)
// 100% Offline, Touch-Safe, Mobile-First, SafeStorage Enabled
// ==========================================================================

const STUDENT_STORAGE_KEY = 'tka_english_2025_pilihan_student';
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
  fontSizeLevel: 0,
  fontFamily: 'serif',
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
  showStudentToast('✅ Profile saved successfully!');
}

function setupStudentEvents() {
  // Mobile responsive resize listener if needed
  window.addEventListener('resize', () => {
    // Keep mobile state consistent
  });
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
  // find first question index for this text
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

  // Sync selectedTextId with currentQ.textId
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
        <span class="p-num">${idx + 1}</span>
        <p class="reading-text">${p.trim()}</p>
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

    btn.textContent = q.number < 10 ? `0${q.number}` : `${q.number}`;
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

  if (q.questionType === 'multiple-choice') {
    interactionHtml = `
      <div class="options-container">
        ${q.options.map(opt => {
          const isChecked = studentAns === opt.id;
          return `
            <label class="option-card ${isChecked ? 'selected' : ''}" onclick="selectStudentSingleAnswer('${q.id}', '${opt.id}')">
              <input type="radio" name="student_opt_${q.id}" value="${opt.id}" ${isChecked ? 'checked' : ''} style="display:none;">
              <span class="option-pill">${opt.id}</span>
              <span class="option-text">${opt.text}</span>
            </label>
          `;
        }).join('')}
      </div>
    `;
  } else if (q.questionType === 'multiple-choice-multiple-answers') {
    const selectedArr = Array.isArray(studentAns) ? studentAns : [];
    interactionHtml = `
      <div style="margin-bottom:12px; font-size:0.88rem; color:var(--academic-blue); font-weight:700;">
        💡 Petunjuk: Anda dapat memilih lebih dari satu opsi yang tepat (Multiple Selection).
      </div>
      <div class="options-container">
        ${q.options.map(opt => {
          const isChecked = selectedArr.includes(opt.id);
          return `
            <label class="option-card ${isChecked ? 'selected' : ''}" onclick="toggleStudentMultiAnswer('${q.id}', '${opt.id}')">
              <input type="checkbox" name="student_opt_${q.id}" value="${opt.id}" ${isChecked ? 'checked' : ''} style="display:none;">
              <span class="option-pill">${opt.id}</span>
              <span class="option-text">${opt.text}</span>
            </label>
          `;
        }).join('')}
      </div>
    `;
  } else if (q.questionType === 'matrix-grid' || q.matrixStatements) {
    const statements = q.matrixStatements || [];
    const matrixAns = (typeof studentAns === 'object' && studentAns !== null && !Array.isArray(studentAns)) ? studentAns : {};
    
    interactionHtml = `
      <div style="margin-bottom:12px; font-size:0.88rem; color:var(--academic-blue); font-weight:700;">
        💡 Petunjuk: Tentukan status kebenaran (True / False / Not Mentioned) untuk setiap pernyataan berikut:
      </div>
      <div class="matrix-grid-table-wrap">
        <table class="matrix-table" style="width:100%; border-collapse:collapse; margin-bottom:16px;">
          <thead>
            <tr style="background:var(--bg-card-alt); border-bottom:2px solid var(--border-color);">
              <th style="padding:10px 12px; text-align:left; font-size:0.85rem; color:var(--text-muted);">Pernyataan / Statement</th>
              <th style="padding:10px 12px; text-align:center; font-size:0.85rem; width:80px; color:var(--text-muted);">True</th>
              <th style="padding:10px 12px; text-align:center; font-size:0.85rem; width:80px; color:var(--text-muted);">False</th>
              <th style="padding:10px 12px; text-align:center; font-size:0.85rem; width:110px; color:var(--text-muted);">Not Mentioned</th>
            </tr>
          </thead>
          <tbody>
            ${statements.map((stmt, sIdx) => {
              const rowVal = matrixAns[stmt.id] || '';
              return `
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:10px 12px; font-size:0.92rem; color:var(--text-main); line-height:1.4;">
                    <strong>${sIdx + 1}.</strong> ${stmt.text}
                  </td>
                  <td style="padding:10px 12px; text-align:center;">
                    <input type="radio" name="matrix_row_${q.id}_${stmt.id}" value="True" ${rowVal === 'True' ? 'checked' : ''} onchange="setStudentMatrixValue('${q.id}', '${stmt.id}', 'True')">
                  </td>
                  <td style="padding:10px 12px; text-align:center;">
                    <input type="radio" name="matrix_row_${q.id}_${stmt.id}" value="False" ${rowVal === 'False' ? 'checked' : ''} onchange="setStudentMatrixValue('${q.id}', '${stmt.id}', 'False')">
                  </td>
                  <td style="padding:10px 12px; text-align:center;">
                    <input type="radio" name="matrix_row_${q.id}_${stmt.id}" value="Not Mentioned" ${rowVal === 'Not Mentioned' ? 'checked' : ''} onchange="setStudentMatrixValue('${q.id}', '${stmt.id}', 'Not Mentioned')">
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
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
        <span class="q-badge badge-blue">QUESTION ${q.number < 10 ? '0' + q.number : q.number}</span>
        <span class="q-badge badge-amber">${q.questionType.toUpperCase()}</span>
        <span class="q-badge" style="background:#e0f2fe; color:#0284c7;">HOTS ANALYSIS</span>
      </div>
      <div class="question-stem-text" style="font-size:1.05rem; font-weight:700; color:var(--text-main); line-height:1.6; margin-bottom:16px;">
        ${q.prompt}
      </div>
    </div>

    ${interactionHtml}

    <!-- CRITICAL REASONING & EVIDENCE AREA -->
    <div class="student-reasoning-card" style="margin-top:20px; background:var(--bg-card-alt); border-radius:12px; padding:16px; border:1px solid var(--border-color);">
      <label style="display:block; font-size:0.92rem; font-weight:800; color:var(--text-main); margin-bottom:6px;">
        ✍️ Textual Evidence & Logical Reasoning (Kutipan Bukti Teks & Penalaran Kritis Siswa):
      </label>
      <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:10px; line-height:1.4;">
        Tuliskan kalimat bukti dari teks (paragraf ke berapa) dan alasan logis mengapa Anda yakin memilih jawaban di atas.
      </p>
      <textarea
        id="student-reason-input-${q.id}"
        class="student-reason-textarea"
        style="width:100%; min-height:85px; padding:12px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); font-family:var(--font-sans); font-size:0.92rem; line-height:1.5; resize:vertical;"
        placeholder="Contoh: Jawaban saya didasarkan pada Paragraf 2 kalimat ke-3 yang menyatakan bahwa... Oleh karena itu..."
        oninput="handleStudentReasonInput('${q.id}', this.value)"
      >${studentReason}</textarea>
    </div>

    <!-- WORKSPACE NAVIGATION BUTTONS -->
    <div class="workspace-action-nav" style="margin-top:24px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
      <button class="btn btn-secondary" onclick="prevStudentQuestion()" ${StudentState.currentQuestionIndex === 0 ? 'disabled' : ''}>
        ◄ Previous Question
      </button>

      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" onclick="setStudentView('worksheet_summary')">
          📋 View Answer Sheet
        </button>
        <button class="btn btn-primary" onclick="nextStudentQuestion()">
          ${StudentState.currentQuestionIndex === MASTER_QUESTIONS.length - 1 ? 'Finish & Check Summary →' : 'Next Question ►'}
        </button>
      </div>
    </div>
  `;
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
  showStudentToast(`✅ Option ${optId} selected`);
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

function setStudentMatrixValue(qId, statementId, val) {
  if (!StudentState.answers[qId]) {
    StudentState.answers[qId] = { answer: {}, reason: '', timestamp: Date.now() };
  }
  if (typeof StudentState.answers[qId].answer !== 'object' || Array.isArray(StudentState.answers[qId].answer) || StudentState.answers[qId].answer === null) {
    StudentState.answers[qId].answer = {};
  }
  StudentState.answers[qId].answer[statementId] = val;
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
  applyStudentTypography();
}

function toggleStudentFontFamily() {
  StudentState.fontFamily = StudentState.fontFamily === 'serif' ? 'sans' : 'serif';
  applyStudentTypography();
}

function applyStudentTypography() {
  const readPanel = document.getElementById('student-reading-panel');
  const fontLabel = document.getElementById('student-font-label');

  if (fontLabel) {
    fontLabel.textContent = StudentState.fontFamily === 'serif' ? 'Serif' : 'Sans';
  }

  if (readPanel) {
    readPanel.classList.remove('font-serif', 'font-sans', 'size-sm', 'size-md', 'size-lg');
    readPanel.classList.add(StudentState.fontFamily === 'serif' ? 'font-serif' : 'font-sans');

    if (StudentState.fontSizeLevel === -1) readPanel.classList.add('size-sm');
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
      <div class="reading-paragraph" style="margin-bottom:12px;">
        <span class="p-num" style="display:inline-block; margin-right:6px;">${idx + 1}</span>
        <p style="display:inline; line-height:1.6; font-size:0.95rem;">${p.trim()}</p>
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

  // Render Based on Active Mode
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
    <div style="margin:16px 0; font-size:0.92rem; color:var(--text-muted);">
      Showing <strong>${list.length}</strong> terms. Click or tap any card to flip and view contextual definition. Click 🔊 for audio pronunciation.
    </div>
    <div class="flipcard-grid">
      ${list.map(v => `
        <div class="flipcard-wrapper" onclick="toggleCardFlip(this)">
          <div class="flipcard-inner">
            <!-- FRONT -->
            <div class="flipcard-front">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span class="vocab-pos-badge">${v.pos || 'Term'}</span>
                <button class="btn-tts" onclick="event.stopPropagation(); speakStudentWord('${v.word.replace(/'/g, "\\'")}');" title="Listen Audio Pronunciation">
                  🔊
                </button>
              </div>
              <h3 class="flipcard-word">${v.word}</h3>
              <div class="flipcard-phonetic">${v.phonetic || ''}</div>
              <div class="flipcard-hint">💡 Tap to reveal meaning & sentence ↻</div>
            </div>

            <!-- BACK -->
            <div class="flipcard-back">
              <div class="flipcard-arti">${v.arti}</div>
              <div class="flipcard-simple"><strong>Makna Sederhana:</strong> ${v.simpleMeaning || v.contextualMeaning}</div>
              <div class="flipcard-sentence">"${v.sentence || ''}"</div>
              <div class="flipcard-footer">
                <span>📌 ${v.relatedQuestion || 'Text Reference'}</span>
                <button class="btn-tts-sm" onclick="event.stopPropagation(); speakStudentWord('${v.word.replace(/'/g, "\\'")}');">🔊 Listen</button>
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
  // Take 6 random pairs from list
  const sample = [...list].sort(() => 0.5 - Math.random()).slice(0, 6);
  if (sample.length < 3) {
    container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">Need at least 3 terms to play matching game. Please choose 'All Passages'.</div>`;
    return;
  }

  // Prepare shuffled left & right
  const leftItems = sample.map(v => ({ id: v.id, word: v.word })).sort(() => 0.5 - Math.random());
  const rightItems = sample.map(v => ({ id: v.id, arti: v.arti })).sort(() => 0.5 - Math.random());

  StudentState.matchingState = {
    selectedLeft: null,
    selectedRight: null,
    matchedPairs: []
  };

  container.innerHTML = `
    <div style="background:var(--bg-card); border-radius:14px; padding:24px; border:1px solid var(--border-color); margin-top:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
        <div>
          <h3 style="font-size:1.25rem; font-weight:800; color:var(--text-main);">🧩 Match the Specialized Terms with Indonesian Meanings</h3>
          <p style="font-size:0.88rem; color:var(--text-muted);">Select one English term on the left, then click its corresponding meaning on the right.</p>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="renderStudentVocabLab()">🔄 New Round</button>
      </div>

      <div class="matching-grid-container" style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
        <!-- Left column -->
        <div id="matching-left-col" style="display:flex; flex-direction:column; gap:12px;">
          ${leftItems.map(item => `
            <div class="match-card match-left" data-id="${item.id}" onclick="handleMatchSelect('left', ${item.id})">
              ${item.word}
            </div>
          `).join('')}
        </div>

        <!-- Right column -->
        <div id="matching-right-col" style="display:flex; flex-direction:column; gap:12px;">
          ${rightItems.map(item => `
            <div class="match-card match-right" data-id="${item.id}" onclick="handleMatchSelect('right', ${item.id})">
              ${item.arti}
            </div>
          `).join('')}
        </div>
      </div>

      <div id="matching-win-banner" style="display:none; margin-top:20px; text-align:center; padding:16px; background:#dcfce7; border-radius:12px; color:#166534; font-weight:800;">
        🎉 Great job! All 6 pairs matched correctly!
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
      if (parseInt(el.getAttribute('data-id'), 10) === id) el.classList.add('selected');
      else el.classList.remove('selected');
    });
  } else if (col === 'right') {
    state.selectedRight = id;
    document.querySelectorAll('.match-right').forEach(el => {
      if (parseInt(el.getAttribute('data-id'), 10) === id) el.classList.add('selected');
      else el.classList.remove('selected');
    });
  }

  // Check if both selected
  if (state.selectedLeft !== null && state.selectedRight !== null) {
    if (state.selectedLeft === state.selectedRight) {
      // MATCH!
      state.matchedPairs.push(state.selectedLeft);
      document.querySelectorAll(`[data-id="${state.selectedLeft}"]`).forEach(el => {
        el.classList.remove('selected');
        el.classList.add('matched');
      });
      showStudentToast('🎯 Correct Match!');
      if (state.matchedPairs.length === 6) {
        const win = document.getElementById('matching-win-banner');
        if (win) win.style.display = 'block';
      }
    } else {
      // MISMATCH!
      showStudentToast('❌ Not a match, try again!');
      document.querySelectorAll('.match-card.selected').forEach(el => {
        el.classList.add('shake');
        setTimeout(() => el.classList.remove('shake', 'selected'), 500);
      });
    }
    state.selectedLeft = null;
    state.selectedRight = null;
  }
}

// Mode 3: Context Challenge
function renderVocabContextChallenge(container, list) {
  if (list.length < 4) {
    container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">Need more terms for context quiz. Please choose 'All Passages'.</div>`;
    return;
  }

  // Build 5 questions
  const questions = [...list].sort(() => 0.5 - Math.random()).slice(0, 5).map(target => {
    const distractors = list.filter(v => v.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [target, ...distractors].sort(() => 0.5 - Math.random());
    return {
      target,
      options
    };
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
      <div style="background:var(--bg-card); border-radius:14px; padding:30px; text-align:center; border:1px solid var(--border-color); margin-top:16px;">
        <h3 style="font-size:1.8rem; font-weight:900; color:var(--text-main); margin-bottom:10px;">🏆 Challenge Complete!</h3>
        <p style="font-size:1.1rem; color:var(--text-secondary); margin-bottom:20px;">
          You scored <strong>${state.score} / ${state.questions.length}</strong> in the Context Vocab Challenge!
        </p>
        <button class="btn btn-primary" onclick="setStudentVocabActivity('context')">🔄 Play Again</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="background:var(--bg-card); border-radius:14px; padding:24px; border:1px solid var(--border-color); margin-top:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <span class="q-badge badge-blue">Question ${state.currentIndex + 1} of ${state.questions.length}</span>
        <span style="font-weight:800; color:var(--academic-blue);">Score: ${state.score}</span>
      </div>

      <div style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:8px;">
        Which term best matches the following meaning/context?
      </div>
      <div style="font-size:1.05rem; background:var(--bg-card-alt); padding:16px; border-radius:10px; border-left:4px solid var(--academic-blue); color:var(--text-secondary); margin-bottom:20px; line-height:1.5;">
        "${current.target.arti}"
        <div style="font-size:0.85rem; color:var(--text-muted); margin-top:6px;">Context: ${current.target.contextualMeaning || current.target.simpleMeaning}</div>
      </div>

      <div class="options-container">
        ${current.options.map(opt => `
          <div class="option-card" onclick="handleContextQuizSelect(${opt.id}, ${current.target.id})">
            <span class="option-pill" style="font-size:0.8rem;">${opt.pos || 'Term'}</span>
            <span class="option-text" style="font-weight:700;">${opt.word}</span>
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
    <div style="background:var(--bg-card); border-radius:14px; padding:20px; border:1px solid var(--border-color); margin-top:16px;">
      <div style="margin-bottom:16px; display:flex; gap:12px; align-items:center;">
        <input
          type="text"
          id="input-vocab-search"
          placeholder="🔍 Search 90 terms, definitions, phonetics..."
          style="width:100%; padding:10px 14px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-card-alt); color:var(--text-main); font-size:0.95rem;"
          value="${StudentState.vocabSearchQuery}"
          oninput="handleVocabSearch(this.value)"
        >
      </div>

      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
          <thead>
            <tr style="background:var(--bg-card-alt); text-align:left; border-bottom:2px solid var(--border-color);">
              <th style="padding:10px 12px;">#</th>
              <th style="padding:10px 12px;">English Term</th>
              <th style="padding:10px 12px;">Phonetic & POS</th>
              <th style="padding:10px 12px;">Arti (Indonesian)</th>
              <th style="padding:10px 12px;">Context & Sentence</th>
              <th style="padding:10px 12px;">Audio</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((v, idx) => `
              <tr style="border-bottom:1px solid var(--border-color);">
                <td style="padding:10px 12px; color:var(--text-muted);">${v.id}</td>
                <td style="padding:10px 12px; font-weight:800; color:var(--academic-blue);">${v.word}</td>
                <td style="padding:10px 12px; color:var(--text-muted);"><small>${v.phonetic || ''}<br><em>${v.pos || ''}</em></small></td>
                <td style="padding:10px 12px; color:var(--text-main); font-weight:600;">${v.arti}</td>
                <td style="padding:10px 12px; color:var(--text-secondary); font-size:0.85rem; line-height:1.4;">
                  ${v.simpleMeaning || v.contextualMeaning}<br>
                  <em style="color:var(--text-muted);">"${v.sentence || ''}"</em>
                </td>
                <td style="padding:10px 12px; text-align:center;">
                  <button class="btn-tts-sm" onclick="speakStudentWord('${v.word.replace(/'/g, "\\'")}');">🔊</button>
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

function speakStudentWord(word) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } else {
    showStudentToast('⚠️ Speech Synthesis not supported on this browser');
  }
}

// ==========================================
// 4. STRATEGY GUIDE VIEW
// ==========================================
function renderStudentStrategy() {
  const container = document.getElementById('student-strategy-cards-container');
  if (!container || typeof STRATEGIES === 'undefined') return;

  container.innerHTML = '';
  STRATEGIES.forEach(strat => {
    const card = document.createElement('div');
    card.className = 'strategy-card';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <span class="strategy-badge">${strat.category}</span>
        <span style="font-size:0.8rem; color:var(--text-muted);">${strat.id.toUpperCase()}</span>
      </div>
      <h3 class="strategy-title">${strat.title}</h3>
      <p class="strategy-short-desc">${strat.shortExplanation}</p>

      <div style="margin-top:14px; background:var(--bg-card-alt); border-radius:10px; padding:12px; border:1px solid var(--border-color);">
        <div style="font-size:0.85rem; font-weight:800; color:var(--academic-blue); margin-bottom:6px;">📋 Step-by-Step Method:</div>
        <ul style="margin:0; padding-left:18px; font-size:0.85rem; color:var(--text-secondary); line-height:1.5;">
          ${strat.howToDo.map(step => `<li>${step}</li>`).join('')}
        </ul>
      </div>

      <div style="margin-top:10px; background:var(--accent-amber-light); border-radius:10px; padding:10px 12px; border:1px solid rgba(217, 119, 6, 0.2);">
        <div style="font-size:0.82rem; font-weight:800; color:var(--accent-amber); margin-bottom:4px;">⚠️ Distractor Trap Alert:</div>
        <p style="margin:0; font-size:0.82rem; color:var(--text-secondary); line-height:1.4;">
          ${strat.trapAlert || 'Waspadai opsi yang mengulang kata persis dari teks namun mengubah relasi logika atau makna utamanya.'}
        </p>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// 5. WORKSHEET SUMMARY & CHECK VIEW
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

  const pct = Math.round((answered / total) * 100);

  container.innerHTML = `
    <!-- Header Card -->
    <div style="background:var(--bg-card); border-radius:14px; padding:24px; border:1px solid var(--border-color); margin-bottom:24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:16px;">
        <div>
          <span class="q-badge badge-blue">STUDENT WORKSHEET SUMMARY</span>
          <h2 style="font-size:1.6rem; font-weight:900; color:var(--text-main); margin-top:6px;">📋 My Complete Answer Sheet</h2>
          <p style="font-size:0.92rem; color:var(--text-muted);">
            TKA Bahasa Inggris SMA 2025 Pilihan • 30 Soal HOTS & Lembar Penalaran Kritis
          </p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary btn-sm" onclick="printStudentWorksheet()">🖨️ Print / Save as PDF</button>
          <button class="btn btn-secondary btn-sm" onclick="setStudentView('dashboard')">← Dashboard</button>
        </div>
      </div>

      <!-- Student Profile Badge Box -->
      <div class="summary-profile-box" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; background:var(--bg-card-alt); padding:16px; border-radius:10px; border:1px solid var(--border-color); margin-bottom:20px;">
        <div><strong>Student Name:</strong> <span style="color:var(--academic-blue);">${StudentState.profile.name || '(Not Filled)'}</span></div>
        <div><strong>Class / Group:</strong> <span style="color:var(--academic-blue);">${StudentState.profile.class || '(Not Filled)'}</span></div>
        <div><strong>School:</strong> <span>${StudentState.profile.school || 'SMA Plus PGRI Cibinong'}</span></div>
        <div><strong>Advisor / Teacher:</strong> <span>${StudentState.profile.teacher || 'Muhammad Falahaen Jiddan, M.Pd. Gr.'}</span></div>
      </div>

      <!-- Progress Stats -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:12px;">
        <div style="background:var(--bg-card); padding:12px; border-radius:8px; border:1px solid var(--border-color); text-align:center;">
          <div style="font-size:1.4rem; font-weight:900; color:var(--academic-blue);">${answered}/${total}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">Questions Answered</div>
        </div>
        <div style="background:var(--bg-card); padding:12px; border-radius:8px; border:1px solid var(--border-color); text-align:center;">
          <div style="font-size:1.4rem; font-weight:900; color:#059669;">${reasoned}/${total}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">Reasoning Written</div>
        </div>
        <div style="background:var(--bg-card); padding:12px; border-radius:8px; border:1px solid var(--border-color); text-align:center;">
          <div style="font-size:1.4rem; font-weight:900; color:var(--accent-purple);">${pct}%</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">Completion Rate</div>
        </div>
      </div>
    </div>

    <!-- Summary Questions Table -->
    <div style="background:var(--bg-card); border-radius:14px; padding:20px; border:1px solid var(--border-color);">
      <h3 style="font-size:1.25rem; font-weight:800; color:var(--text-main); margin-bottom:16px;">
        📝 Detailed Question-by-Question Worksheet:
      </h3>

      <div style="display:flex; flex-direction:column; gap:16px;">
        ${MASTER_QUESTIONS.map(q => {
          const ansRec = StudentState.answers[q.id] || { answer: null, reason: '' };
          const hasAns = ansRec.answer !== undefined && ansRec.answer !== null && ansRec.answer !== '' && (!Array.isArray(ansRec.answer) || ansRec.answer.length > 0);
          
          let displayAns = '<span style="color:var(--text-muted);">[Belum Dijawab]</span>';
          if (hasAns) {
            if (Array.isArray(ansRec.answer)) {
              displayAns = `<span class="badge badge-blue">Options: ${ansRec.answer.join(', ')}</span>`;
            } else if (typeof ansRec.answer === 'object') {
              displayAns = Object.entries(ansRec.answer).map(([sId, val]) => `<div><small>${sId}: <strong>${val}</strong></small></div>`).join('');
            } else {
              displayAns = `<span class="badge badge-blue">Option: ${ansRec.answer}</span>`;
            }
          }

          const hasReason = ansRec.reason && ansRec.reason.trim().length > 0;

          return `
            <div style="background:var(--bg-card-alt); border-radius:10px; padding:16px; border:1px solid var(--border-color);">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
                <div>
                  <span class="q-badge badge-blue">QUESTION 0${q.number < 10 ? '0' + q.number : q.number}</span>
                  <span style="font-size:0.82rem; color:var(--text-muted); margin-left:6px;">(${q.textId.toUpperCase()})</span>
                </div>
                <button class="btn btn-outline btn-sm" onclick="goToQuestionFromSummary(${q.number})">✏️ Edit Answer</button>
              </div>

              <div style="font-weight:700; color:var(--text-main); font-size:0.95rem; margin-bottom:10px;">
                ${q.prompt}
              </div>

              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
                <div style="background:var(--bg-card); padding:10px 14px; border-radius:8px; border:1px solid var(--border-color);">
                  <div style="font-size:0.8rem; font-weight:800; color:var(--text-muted); margin-bottom:4px;">Selected Answer:</div>
                  <div>${displayAns}</div>
                </div>

                <div style="background:var(--bg-card); padding:10px 14px; border-radius:8px; border:1px solid var(--border-color);">
                  <div style="font-size:0.8rem; font-weight:800; color:var(--text-muted); margin-bottom:4px;">Textual Evidence & Reasoning:</div>
                  <div style="font-size:0.88rem; color:var(--text-secondary); line-height:1.4;">
                    ${hasReason ? ansRec.reason : '<em style="color:var(--text-muted);">Tidak ada penalaran yang ditulis.</em>'}
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

function goToQuestionFromSummary(qNum) {
  StudentState.currentQuestionIndex = qNum - 1;
  setStudentView('student_workspace');
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
