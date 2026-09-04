// APP ENGINE FOR INTERACTIVE TKA BAHASA INGGRIS 2025

let currentQuestionIndex = 0;
let userAnswers = {}; // { qId: { submitted: bool, answer: val, isCorrect: bool } }
let activeTextFilter = "ALL";
let vocabSearchQuery = "";

// VOCAB GAME STATE
let gameQuestions = [];
let gameCurrentIndex = 0;
let gameScore = 0;
let gameStreak = 0;
let gameMaxStreak = 0;
let gameAnswered = false;

if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

function initApp() {
  initTabs();
  renderStrategies();
  renderQuestion(currentQuestionIndex);
  renderNavigator();
  renderVocabulary();
  initVocabFilters();
  initGameWorkspace();
}

// TAB SYSTEM
function initTabs() {
  const tabBtns = document.querySelectorAll(".nav-tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll(".nav-tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

  const targetBtn = document.querySelector(`.nav-tab-btn[data-tab="${tabId}"]`);
  const targetContent = document.getElementById(tabId);

  if (targetBtn && targetContent) {
    targetBtn.classList.add("active");
    targetContent.classList.add("active");
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (tabId === "tab-game" && gameQuestions.length === 0) {
      startVocabGame();
    }
  }
}

// TAB 1 — STRATEGIES RENDERING
function renderStrategies() {
  const container = document.getElementById("strategies-container");
  if (!container) return;

  container.innerHTML = STRATEGIES.map(strat => `
    <div class="strategy-card">
      <div>
        <span class="strategy-badge">${strat.category}</span>
        <h3 class="strategy-title">${strat.title}</h3>
        <p class="strategy-explanation">${strat.shortExplanation}</p>
        
        <div class="strategy-section-heading">How to do it</div>
        <ul class="strategy-steps">
          ${strat.howToDo.map(step => `<li>${step}</li>`).join("")}
        </ul>

        <div class="quick-tip-box">
          <strong>💡 QUICK TIP:</strong> ${strat.quickTip}
        </div>
      </div>

      <div>
        <div class="strategy-section-heading">Appears in TKA Questions</div>
        <div class="appears-in-tags">
          ${strat.appearsIn.map(qNum => `
            <button class="q-tag-btn" onclick="jumpToQuestion(${qNum})">Question ${qNum < 10 ? '0' + qNum : qNum}</button>
          `).join("")}
        </div>
      </div>
    </div>
  `).join("");
}

// TAB 2 — TKA QUESTIONS ENGINE
function renderQuestion(index) {
  const q = MASTER_QUESTIONS[index];
  if (!q) return;

  currentQuestionIndex = index;
  const passage = PASSAGES.find(p => p.id === q.textId);

  // Render Reading Passage
  const passageTitleEl = document.getElementById("passage-title");
  const passageBodyEl = document.getElementById("passage-body");
  const passageSourceEl = document.getElementById("passage-source");
  const passageTagEl = document.getElementById("passage-tag");

  if (passage) {
    passageTagEl.textContent = `READING TEXT ${passage.number}`;
    passageTitleEl.textContent = passage.title;
    passageBodyEl.textContent = passage.text;
    passageSourceEl.textContent = passage.source;
  }

  // Update Progress Bar
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");
  const pct = Math.round(((index + 1) / MASTER_QUESTIONS.length) * 100);
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `Question ${index + 1} of ${MASTER_QUESTIONS.length} (${pct}%)`;

  // Render Question Metadata
  document.getElementById("q-num-badge").textContent = `QUESTION ${q.id < 10 ? '0' + q.id : q.id}`;
  document.getElementById("q-type-badge").textContent = formatQType(q.type);
  document.getElementById("q-hots-badge").style.display = q.hots ? "inline-block" : "none";
  document.getElementById("q-prompt").textContent = q.prompt;

  // Render Interaction Area
  const interactionArea = document.getElementById("interaction-area");
  const state = userAnswers[q.id] || { submitted: false, answer: null };

  if (q.type === "mc" || q.type === "mcma") {
    interactionArea.innerHTML = `
      <div class="options-list">
        ${q.options.map(opt => {
          const isChecked = isOptionSelected(state.answer, opt.id, q.type);
          const isLocked = state.submitted ? "locked" : "";
          const isSelectedClass = isChecked ? "selected" : "";
          const inputType = q.type === "mc" ? "radio" : "checkbox";
          return `
            <label class="option-item ${isSelectedClass} ${isLocked}">
              <input type="${inputType}" name="option-q${q.id}" value="${opt.id}" 
                     class="option-input" ${isChecked ? "checked" : ""} 
                     ${state.submitted ? "disabled" : ""} 
                     onchange="handleOptionSelect('${q.id}', '${opt.id}', '${q.type}')">
              <span class="option-label"><strong>${opt.id}.</strong> ${opt.text}</span>
            </label>
          `;
        }).join("")}
      </div>
    `;
  } else if (q.type === "matrix") {
    interactionArea.innerHTML = `
      <div class="matrix-table-wrapper">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>${q.matrixHeaders[0]}</th>
              <th class="matrix-radio-cell">${q.matrixHeaders[1]}</th>
              <th class="matrix-radio-cell">${q.matrixHeaders[2]}</th>
            </tr>
          </thead>
          <tbody>
            ${q.matrixRows.map((row, rIdx) => {
              const selectedVal = state.answer ? state.answer[rIdx] : null;
              const h1 = q.matrixHeaders[1];
              const h2 = q.matrixHeaders[2];
              return `
                <tr>
                  <td><strong>${rIdx + 1}.</strong> ${row.text}</td>
                  <td class="matrix-radio-cell">
                    <input type="radio" name="matrix-row-${q.id}-${rIdx}" value="${h1}"
                           ${selectedVal === h1 ? "checked" : ""}
                           ${state.submitted ? "disabled" : ""}
                           onchange="handleMatrixSelect(${q.id}, ${rIdx}, '${h1}')">
                  </td>
                  <td class="matrix-radio-cell">
                    <input type="radio" name="matrix-row-${q.id}-${rIdx}" value="${h2}"
                           ${selectedVal === h2 ? "checked" : ""}
                           ${state.submitted ? "disabled" : ""}
                           onchange="handleMatrixSelect(${q.id}, ${rIdx}, '${h2}')">
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // Submit Button
  const submitBtn = document.getElementById("btn-submit-answer");
  submitBtn.disabled = state.submitted || !hasSelectedAnswer(q.id);
  submitBtn.textContent = state.submitted ? "ANSWER SUBMITTED" : "SUBMIT ANSWER";

  // Feedback Panel
  const feedbackContainer = document.getElementById("feedback-container");
  if (state.submitted) {
    renderFeedback(q, state, feedbackContainer);
  } else {
    feedbackContainer.innerHTML = "";
  }

  // Update Nav Buttons
  document.getElementById("btn-prev-q").disabled = index === 0;
  document.getElementById("btn-next-q").disabled = index === MASTER_QUESTIONS.length - 1;

  renderNavigator();
}

function formatQType(type) {
  if (type === "mc") return "Multiple Choice";
  if (type === "mcma") return "Multiple Response (MCMA)";
  if (type === "matrix") return "Categorization / Matrix";
  return type;
}

function isOptionSelected(userAnswer, optionId, type) {
  if (!userAnswer) return false;
  if (type === "mc") return userAnswer === optionId;
  if (type === "mcma") return Array.isArray(userAnswer) && userAnswer.includes(optionId);
  return false;
}

function hasSelectedAnswer(qId) {
  const q = MASTER_QUESTIONS.find(item => item.id === qId);
  const state = userAnswers[qId];
  if (!state || !state.answer) return false;
  if (q.type === "mc") return true;
  if (q.type === "mcma") return state.answer.length > 0;
  if (q.type === "matrix") return state.answer.length === q.matrixRows.length && !state.answer.includes(null);
  return false;
}

function handleOptionSelect(qId, optId, type) {
  const q = MASTER_QUESTIONS.find(item => item.id === qId);
  if (!userAnswers[qId]) {
    userAnswers[qId] = { submitted: false, answer: null };
  }

  if (type === "mc") {
    userAnswers[qId].answer = optId;
  } else if (type === "mcma") {
    let arr = userAnswers[qId].answer || [];
    if (arr.includes(optId)) {
      arr = arr.filter(id => id !== optId);
    } else {
      arr.push(optId);
    }
    userAnswers[qId].answer = arr;
  }

  renderQuestion(currentQuestionIndex);
}

function handleMatrixSelect(qId, rowIdx, val) {
  const q = MASTER_QUESTIONS.find(item => item.id === qId);
  if (!userAnswers[qId]) {
    userAnswers[qId] = { submitted: false, answer: new Array(q.matrixRows.length).fill(null) };
  }
  userAnswers[qId].answer[rowIdx] = val;

  renderQuestion(currentQuestionIndex);
}

// SUBMIT ANSWER HANDLER
function submitCurrentAnswer() {
  const q = MASTER_QUESTIONS[currentQuestionIndex];
  const state = userAnswers[q.id];
  if (!state || !state.answer || state.submitted) return;

  state.submitted = true;
  state.isCorrect = checkIsCorrect(q, state.answer);

  renderQuestion(currentQuestionIndex);
}

function checkIsCorrect(q, userAnswer) {
  if (q.type === "mc") {
    return userAnswer === q.correctAnswer;
  }
  if (q.type === "mcma") {
    if (!Array.isArray(userAnswer)) return false;
    const sortedUser = [...userAnswer].sort();
    const sortedKey = [...q.correctAnswer].sort();
    return JSON.stringify(sortedUser) === JSON.stringify(sortedKey);
  }
  if (q.type === "matrix") {
    if (!Array.isArray(userAnswer)) return false;
    return JSON.stringify(userAnswer) === JSON.stringify(q.correctAnswer);
  }
  return false;
}

// RENDER FEEDBACK PANEL
function renderFeedback(q, state, container) {
  const isCorrect = state.isCorrect;
  const statusClass = isCorrect ? "correct" : "incorrect";
  const icon = isCorrect ? "✅ CORRECT!" : "❌ INCORRECT";

  let correctText = "";
  if (q.type === "mc") {
    correctText = `[${q.correctAnswer}]`;
  } else if (q.type === "mcma") {
    correctText = q.correctAnswer.map(ans => `[${ans}]`).join(" + ");
  } else if (q.type === "matrix") {
    correctText = q.matrixRows.map((r, i) => `${i+1}. ${q.correctAnswer[i]}`).join(" | ");
  }

  let optionAnalysisHtml = "";
  if (q.optionAnalysis) {
    if (Array.isArray(q.optionAnalysis)) {
      optionAnalysisHtml = q.optionAnalysis.map(opt => `
        <div class="analysis-item ${opt.status === 'correct' ? 'correct-analysis' : 'incorrect-analysis'}">
          <strong>${opt.id || opt.text.split(' ')[0]}:</strong> ${opt.text}
        </div>
      `).join("");
    }
  }

  container.innerHTML = `
    <div class="feedback-panel ${statusClass}">
      <div class="feedback-header ${statusClass}">
        ${icon}
      </div>

      <div class="feedback-section-title">CORRECT ANSWER:</div>
      <div style="font-size:1.2rem; font-weight:800; color:var(--accent-blue); margin-bottom:0.75rem;">
        ${correctText}
      </div>

      <div class="feedback-section-title">WHY? (PENJELASAN BAHASA INDONESIA):</div>
      <p class="reasoning-text">${q.explanation}</p>

      <div class="feedback-section-title">EVIDENCE FROM THE TEXT:</div>
      <div class="evidence-box">"${q.evidence}"</div>

      <div class="feedback-section-title">REASONING & LOGIKA:</div>
      <p class="reasoning-text">${q.reasoning}</p>

      <div class="feedback-section-title">OPTION ANALYSIS (BEDAH SETIAP OPSI):</div>
      <div class="option-analysis-list">
        ${optionAnalysisHtml}
      </div>
    </div>
  `;
}

// QUESTION NAVIGATOR
function renderNavigator() {
  const container = document.getElementById("nav-grid-container");
  if (!container) return;

  container.innerHTML = MASTER_QUESTIONS.map((q, idx) => {
    const state = userAnswers[q.id];
    let statusClass = "";
    if (idx === currentQuestionIndex) statusClass += " current";
    if (state && state.submitted) {
      statusClass += state.isCorrect ? " status-correct" : " status-incorrect";
    }

    return `
      <button class="nav-num-btn ${statusClass}" onclick="jumpToQuestion(${q.id})">
        ${q.id < 10 ? '0' + q.id : q.id}
      </button>
    `;
  }).join("");
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    renderQuestion(currentQuestionIndex - 1);
  }
}

function nextQuestion() {
  if (currentQuestionIndex < MASTER_QUESTIONS.length - 1) {
    renderQuestion(currentQuestionIndex + 1);
  }
}

function jumpToQuestion(qNum) {
  const idx = MASTER_QUESTIONS.findIndex(q => q.id === qNum);
  if (idx !== -1) {
    switchTab("tab-questions");
    renderQuestion(idx);
  }
}

// TAB 3 — VOCABULARY ENGINE
function renderVocabulary() {
  const container = document.getElementById("vocab-grid-container");
  if (!container) return;

  let list = VOCABULARY;

  if (activeTextFilter !== "ALL") {
    list = list.filter(v => v.textId === activeTextFilter);
  }

  if (vocabSearchQuery.trim() !== "") {
    const q = vocabSearchQuery.toLowerCase();
    list = list.filter(v => 
      v.word.toLowerCase().includes(q) ||
      v.arti.toLowerCase().includes(q) ||
      v.simpleMeaning.toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No vocabulary found matching your criteria.</div>`;
    return;
  }

  container.innerHTML = list.map(v => `
    <div class="vocab-card" onclick="showVocabDetail(${v.id})">
      <div>
        <div class="vocab-word">${v.word}</div>
        <div class="vocab-meta" style="margin: 0.4rem 0;">
          <span class="vocab-pos">${v.pos}</span>
          <span class="vocab-phonetic">${v.phonetic}</span>
        </div>
        <div class="vocab-arti">🇮🇩 ${v.arti}</div>
      </div>
      
      <div class="vocab-context">
        <strong>Context:</strong> ${v.contextualMeaning}
      </div>

      <div class="vocab-related">
        <span style="color:var(--text-muted);">Text ${v.textId.replace('text-', '')}</span>
        <span class="related-link">View Details & Question ➔</span>
      </div>
    </div>
  `).join("");
}

function initVocabFilters() {
  const searchInput = document.getElementById("vocab-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      vocabSearchQuery = e.target.value;
      renderVocabulary();
    });
  }

  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeTextFilter = btn.getAttribute("data-text-id");
      renderVocabulary();
    });
  });
}

function showVocabDetail(vocabId) {
  const v = VOCABULARY.find(item => item.id === vocabId);
  if (!v) return;

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";
  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) modalOverlay.remove();
  };

  modalOverlay.innerHTML = `
    <div class="modal-card" style="text-align:left; max-width:700px;">
      <h2 style="font-size:2.2rem; font-weight:800; color:#fff; margin-bottom:0.2rem;">${v.word}</h2>
      <div style="margin-bottom:1rem;">
        <span class="vocab-pos">${v.pos}</span>
        <span class="vocab-phonetic" style="margin-left:0.5rem;">${v.phonetic}</span>
      </div>

      <div class="feedback-section-title">ARTI BAHASA INDONESIA:</div>
      <div class="vocab-arti" style="margin-bottom:1rem;">${v.arti}</div>

      <div class="feedback-section-title">MAKNA DALAM TEKS:</div>
      <p style="font-size:1.1rem; color:var(--text-primary); margin-bottom:1rem;">${v.contextualMeaning}</p>

      <div class="feedback-section-title">PENJELASAN SEDERHANA:</div>
      <p style="font-size:1.05rem; color:var(--text-secondary); margin-bottom:1rem;">${v.simpleMeaning}</p>

      <div class="feedback-section-title">KALIMAT DALAM TEKS:</div>
      <div class="evidence-box">"${v.sentence}"</div>

      <div class="feedback-section-title">KETERKAITAN DENGAN SOAL:</div>
      <p style="font-size:1.05rem; color:var(--accent-indigo); margin-bottom:1.5rem;">
        <strong>${v.relatedQuestion}:</strong> ${v.whyItMatters}
      </p>

      <div style="display:flex; justify-content:flex-end; gap:1rem;">
        <button class="btn-hero btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
        <button class="btn-hero btn-primary" onclick="this.closest('.modal-overlay').remove(); jumpToQuestion(${parseInt(v.relatedQuestion.replace(/\D/g,''))})">Open ${v.relatedQuestion}</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);
}

// SCORE SUMMARY & RESULT MODAL
function finishPractice() {
  let submittedCount = 0;
  let correctCount = 0;

  MASTER_QUESTIONS.forEach(q => {
    const s = userAnswers[q.id];
    if (s && s.submitted) {
      submittedCount++;
      if (s.isCorrect) correctCount++;
    }
  });

  const total = MASTER_QUESTIONS.length;
  const pct = Math.round((correctCount / total) * 100);

  let feedbackMsg = "";
  if (pct >= 90) {
    feedbackMsg = "🌟 Excellent! You have demonstrated strong reading comprehension, critical analysis, and test-taking strategies!";
  } else if (pct >= 75) {
    feedbackMsg = "👍 Good job! Review several questions and vocabulary items to boost your performance even further.";
  } else if (pct >= 60) {
    feedbackMsg = "📚 Keep practicing! Focus on identifying text evidence and analyzing distractors carefully.";
  } else {
    feedbackMsg = "💪 Review the strategies and vocabulary cards before trying the TKA questions again!";
  }

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";
  modalOverlay.innerHTML = `
    <div class="modal-card">
      <h2 style="font-size:2rem; font-weight:800; color:#fff;">FINAL RESULT SUMMARY</h2>
      <p style="color:var(--text-muted); font-size:1rem;">TKA Bahasa Inggris SMA/MA/SMK 2025</p>

      <div class="score-circle">
        <div class="score-num">${correctCount}/${total}</div>
        <div class="score-pct">${pct}%</div>
      </div>

      <div class="score-feedback-text">${feedbackMsg}</div>

      <div style="display:flex; justify-content:center; gap:1.5rem; margin-bottom:2rem; font-size:1.1rem; font-weight:700;">
        <span style="color:var(--success);">✓ Correct: ${correctCount}</span>
        <span style="color:var(--error);">✕ Incorrect: ${submittedCount - correctCount}</span>
        <span style="color:var(--warning);">○ Unanswered: ${total - submittedCount}</span>
      </div>

      <div style="display:flex; justify-content:center; gap:1rem;">
        <button class="btn-hero btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close Summary</button>
        <button class="btn-hero btn-primary" onclick="this.closest('.modal-overlay').remove(); switchTab('tab-questions'); renderQuestion(0);">Review Answers</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);
}

// TAB 4 — VOCABULARY GAME ENGINE (10 VOCAB CHALLENGE)
function initGameWorkspace() {
  const container = document.getElementById("game-workspace");
  if (!container) return;
  
  container.innerHTML = `
    <div style="text-align:center; padding:2rem 1rem;">
      <div style="font-size:4rem; margin-bottom:1rem;">🎯</div>
      <h3 style="font-size:1.8rem; font-weight:800; color:#fff; margin-bottom:0.75rem;">10 High-Yield Vocab Challenge</h3>
      <p style="color:var(--text-secondary); max-width:550px; margin:0 auto 1.5rem auto; font-size:1.1rem;">
        Matching 10 essential terms from TKA 2025 reading passages. Score points and build your streak multiplier!
      </p>
      <button class="btn-hero btn-primary" style="font-size:1.2rem; padding:0.9rem 2.2rem;" onclick="startVocabGame()">
        ⚡ START GAME
      </button>
    </div>
  `;
}

function startVocabGame() {
  // Pick 10 High-Yield Vocabulary items
  const highYieldIds = [1, 2, 9, 14, 19, 26, 27, 31, 32, 39]; // 10 representative terms from Texts 1-6
  const targetVocabs = VOCABULARY.filter(v => highYieldIds.includes(v.id));

  // Build 10 Game Round Objects
  gameQuestions = targetVocabs.map((v, i) => {
    // Generate 3 distractors
    const otherVocabs = VOCABULARY.filter(item => item.id !== v.id);
    const shuffledOthers = [...otherVocabs].sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 3);

    let promptText = "";
    let correctAnswerText = "";
    let options = [];

    if (i % 2 === 0) {
      // Type 1: Match Word -> Arti Bahasa Indonesia
      promptText = `What is the correct Indonesian meaning of "${v.word}"?`;
      correctAnswerText = v.arti;
      options = [v.arti, ...distractors.map(d => d.arti)].sort(() => 0.5 - Math.random());
    } else {
      // Type 2: Match Contextual Meaning -> Word
      promptText = `Which term means: "${v.contextualMeaning}"?`;
      correctAnswerText = v.word;
      options = [v.word, ...distractors.map(d => d.word)].sort(() => 0.5 - Math.random());
    }

    return {
      vocabId: v.id,
      word: v.word,
      promptText,
      correctAnswerText,
      options,
      explanation: `[${v.word}] (${v.pos}): ${v.arti} - Context: ${v.contextualMeaning}`
    };
  });

  gameCurrentIndex = 0;
  gameScore = 0;
  gameStreak = 0;
  gameMaxStreak = 0;

  renderGameRound();
}

function renderGameRound() {
  const container = document.getElementById("game-workspace");
  if (!container) return;

  if (gameCurrentIndex >= gameQuestions.length) {
    renderGameResult();
    return;
  }

  const q = gameQuestions[gameCurrentIndex];
  gameAnswered = false;

  container.innerHTML = `
    <div class="game-header-bar">
      <div class="game-stat" style="color:var(--accent-blue);">
        <span>📌 Round ${gameCurrentIndex + 1} / ${gameQuestions.length}</span>
      </div>
      <div class="game-stat" style="color:#ffffff;">
        <span>🏆 Score: ${gameScore}</span>
      </div>
      <div class="game-stat">
        <span class="streak-badge">🔥 Streak: ${gameStreak}x</span>
      </div>
    </div>

    <div class="game-card-question">
      <div class="game-prompt-type">VOCABULARY CHALLENGE</div>
      <div class="game-prompt-text">${q.promptText}</div>
    </div>

    <div id="game-options-container" class="game-options-grid">
      ${q.options.map((opt, idx) => `
        <button class="game-opt-btn" onclick="handleGameAnswer(${idx}, '${escapeQuotes(opt)}')">
          <span style="color:var(--accent-blue); font-weight:800;">${String.fromCharCode(65 + idx)}.</span>
          <span>${opt}</span>
        </button>
      `).join("")}
    </div>

    <div id="game-feedback-area"></div>

    <div style="display:flex; justify-content:flex-end; margin-top:0.5rem;">
      <button id="btn-next-game" class="btn-hero btn-primary" style="display:none;" onclick="nextGameRound()">
        Next Question ►
      </button>
    </div>
  `;
}

function escapeQuotes(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

function handleGameAnswer(selectedIdx, selectedOpt) {
  if (gameAnswered) return;
  gameAnswered = true;

  const q = gameQuestions[gameCurrentIndex];
  const isCorrect = selectedOpt === q.correctAnswerText;

  const buttons = document.querySelectorAll(".game-opt-btn");
  buttons.forEach(btn => btn.disabled = true);

  const feedbackArea = document.getElementById("game-feedback-area");
  const nextBtn = document.getElementById("btn-next-game");

  if (isCorrect) {
    buttons[selectedIdx].classList.add("correct");
    gameScore += 100 + (gameStreak * 20);
    gameStreak++;
    if (gameStreak > gameMaxStreak) gameMaxStreak = gameStreak;

    feedbackArea.innerHTML = `
      <div class="game-feedback-box correct">
        🎉 CORRECT! +${100 + ((gameStreak - 1) * 20)} pts ${gameStreak > 1 ? `(Streak ${gameStreak}x Bonus!)` : ''}<br>
        <span style="font-size:0.95rem; font-weight:500; color:var(--text-primary); margin-top:0.3rem; display:block;">${q.explanation}</span>
      </div>
    `;
  } else {
    buttons[selectedIdx].classList.add("incorrect");
    gameStreak = 0;

    // Highlight correct button
    buttons.forEach(btn => {
      if (btn.innerText.includes(q.correctAnswerText)) {
        btn.classList.add("correct");
      }
    });

    feedbackArea.innerHTML = `
      <div class="game-feedback-box incorrect">
        ❌ INCORRECT!<br>
        <span style="font-size:0.95rem; font-weight:500; color:var(--text-primary); margin-top:0.3rem; display:block;">Correct Answer: <strong>${q.correctAnswerText}</strong><br>${q.explanation}</span>
      </div>
    `;
  }

  nextBtn.style.display = "inline-flex";
}

function nextGameRound() {
  gameCurrentIndex++;
  renderGameRound();
}

function renderGameResult() {
  const container = document.getElementById("game-workspace");
  if (!container) return;

  const maxPossibleScore = 1000;
  const pct = Math.round((gameScore / (maxPossibleScore + 900)) * 100);

  let badge = "🏆 VOCABULARY MASTER";
  if (gameScore < 500) badge = "💪 VOCABULARY EXPLORER";
  else if (gameScore < 800) badge = "⭐ VOCABULARY EXPERT";

  container.innerHTML = `
    <div style="text-align:center; padding:2rem 1rem;">
      <div style="font-size:3.5rem; margin-bottom:0.5rem;">🎉</div>
      <div style="display:inline-block; background:rgba(192, 132, 252, 0.15); color:var(--accent-purple); border:1px solid rgba(192, 132, 252, 0.3); padding:0.4rem 1.2rem; border-radius:20px; font-weight:800; margin-bottom:1rem;">
        ${badge}
      </div>

      <h3 style="font-size:2.2rem; font-weight:900; color:#fff; margin-bottom:0.5rem;">GAME COMPLETED!</h3>
      <p style="color:var(--text-secondary); font-size:1.1rem; margin-bottom:1.5rem;">You finished all 10 High-Yield Vocab Challenge rounds!</p>

      <div style="display:flex; justify-content:center; gap:2rem; margin-bottom:2rem; flex-wrap:wrap;">
        <div style="background:var(--bg-panel); border:1px solid var(--border-color); padding:1rem 1.5rem; border-radius:14px; min-width:140px;">
          <div style="font-size:0.85rem; color:var(--text-muted);">FINAL SCORE</div>
          <div style="font-size:2rem; font-weight:900; color:var(--accent-blue);">${gameScore} pts</div>
        </div>

        <div style="background:var(--bg-panel); border:1px solid var(--border-color); padding:1rem 1.5rem; border-radius:14px; min-width:140px;">
          <div style="font-size:0.85rem; color:var(--text-muted);">MAX STREAK</div>
          <div style="font-size:2rem; font-weight:900; color:var(--warning);">🔥 ${gameMaxStreak}x</div>
        </div>
      </div>

      <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
        <button class="btn-hero btn-primary" style="font-size:1.1rem;" onclick="startVocabGame()">
          🔄 PLAY AGAIN
        </button>
        <button class="btn-hero btn-secondary" style="font-size:1.1rem;" onclick="switchTab('tab-vocabulary')">
          📚 REVIEW VOCABULARY
        </button>
      </div>
    </div>
  `;
}
