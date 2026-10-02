// app.js - Laboratorio Crittografico (Salto del Cavallo & Cifrario di Vigenère)

// ── COSTANTI CRITTOGRAFICHE ──
const ALF25 = "ZABCDEFGHIJKLMNOPQRSTUVXY"; // Z=0, A=1, ..., Y=24 (esclusa W)

// Scacchiera 1 (Tour Standard - Philippe de Chérisey / Priorato)
const BOARD_1 = [
  60, 15, 46, 29, 62, 17, 44, 31,
  47, 28, 61, 16, 45, 30, 63, 18,
  14, 59,  6,  3,  8,  1, 32, 43,
  27, 48,  9, 36,  5, 34, 19, 64,
  58, 13,  4,  7,  2, 21, 42, 33,
  49, 26, 37, 10, 35, 40, 53, 20,
  12, 57, 24, 51, 38, 55, 22, 41,
  25, 50, 11, 56, 23, 52, 39, 54
];

// Scacchiera 2 (Tour Invertito / Speculare)
const BOARD_2 = [
  25, 50, 11, 56, 23, 52, 39, 54,
  12, 57, 24, 51, 38, 55, 22, 41,
  49, 26, 37, 10, 35, 40, 53, 20,
  58, 13,  4,  7,  2, 21, 42, 33,
  27, 48,  9, 36,  5, 34, 19, 64,
  14, 59,  6,  3,  8,  1, 32, 43,
  47, 28, 61, 16, 45, 30, 63, 18,
  60, 15, 46, 29, 62, 17, 44, 31
];

const COLS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ROWS = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Blocco canonico da 64 caratteri della Grande Pergamena
const PARCHMENT_BLOCK_1 = "VCPSJQROLDEUXFOISRETOURNAMALINSURVINTETSONPOISSONSURLEGRILANGENE";

// Stato applicazione
let activeBoardId = 1;
let currentKtTimer = null;
let currentVigTimer = null;
let ktAnimRunning = false;
let ktAnimPaused = false;
let ktCurrentStep = 1;
let ktFullResult = '';

let vigAnimRunning = false;
let vigAnimPaused = false;
let vigCurrentStep = 0;
let vigSteps = [];
let vigFullResult = '';

// ── GESTIONE SCHEDE (TABS) ──
function switchTab(tabId) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

  const btn = document.getElementById('nav-' + tabId);
  const panel = document.getElementById('panel-' + tabId);
  if (btn && panel) {
    btn.classList.add('active');
    panel.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (tabId === 'vigenere') {
    renderTabulaRecta();
  }
}

// ── NOTIFICA TOAST & CLIPBOARD ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

function copyToClipboard(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText || el.textContent;
  if (!text || text === '—' || text.startsWith('Richieste')) return;
  navigator.clipboard.writeText(text.trim()).then(() => {
    showToast('Copiato negli appunti!');
  }).catch(() => {
    showToast('Errore durante la copia');
  });
}

// ── NORMALIZZAZIONE INPUT (ALFABETO 25 LETTERE, SENZA W, Z=0) ──
function cleanInput(text) {
  return text.toUpperCase().replace(/[^A-Z]/g, '').replace(/W/g, 'V');
}

// ============================================================================
// 1. MOTORE SALTO DEL CAVALLO (SOLO DECIFRATURA)
// ============================================================================

function getActiveBoard() {
  return activeBoardId === 1 ? BOARD_1 : BOARD_2;
}

function onBoardChange() {
  const sel = document.getElementById('kt-board-select').value;
  activeBoardId = parseInt(sel, 10);
  const desc = document.getElementById('kt-board-desc');
  if (activeBoardId === 1) {
    desc.innerHTML = `<strong>Scacchiera 1 (Standard):</strong> Tour chiuso del Priorato con partenza in f6 (passo 1). Decifra riordinando le lettere lungo il percorso del cavallo.`;
  } else {
    desc.innerHTML = `<strong>Scacchiera 2 (Speculare):</strong> Inversione speculare con partenza in f3. Decifra riordinando le lettere sul percorso speculare.`;
  }
  updateKtBoardVisual();
  const resultBox = document.getElementById('kt-result');
  if (resultBox) {
    resultBox.textContent = '—';
    resultBox.style.color = '';
  }
  const stepInfo = document.getElementById('kt-step-badge');
  if (stepInfo) stepInfo.textContent = 'In attesa';
  stopKtAnim();
}

function updateKtCharCount() {
  const input = document.getElementById('kt-input');
  const countEl = document.getElementById('kt-count');
  const cleaned = cleanInput(input.value);
  const len = cleaned.length;
  countEl.textContent = `${len}/64 lettere`;
  countEl.className = 'char-count ' + (len === 64 ? 'exact' : (len > 0 ? 'warn' : ''));
  updateKtBoardVisual();

  const resultBox = document.getElementById('kt-result');
  if (resultBox) {
    resultBox.textContent = '—';
    resultBox.style.color = '';
  }
  const stepInfo = document.getElementById('kt-step-badge');
  if (stepInfo) stepInfo.textContent = 'In attesa';
  stopKtAnim();
}

function setKtPreset(presetType) {
  const input = document.getElementById('kt-input');
  if (presetType === 'vigBlock1') {
    // Calcola l'output Vigenère per il Blocco 1
    const cleanT = cleanInput(PARCHMENT_BLOCK_1);
    const { result } = calculateVigenere(cleanT, 'MORTEPEE');
    input.value = result;
  }
  updateKtCharCount();
}

// DECIFRATURA SALTO DEL CAVALLO
function decodeKnightTour(text64, board) {
  const out = new Array(64);
  for (let i = 0; i < 64; i++) {
    const dest = board[i] - 1;
    out[dest] = text64[i] || ' ';
  }
  return out.join('');
}

function updateKtBoardVisual(highlightStep = -1) {
  const boardEl = document.getElementById('chessboard-grid');
  if (!boardEl) return;
  boardEl.innerHTML = '';

  const board = getActiveBoard();
  const input = document.getElementById('kt-input');
  const text = cleanInput(input ? input.value : '');

  // 8 righe (da riga 8 a riga 1)
  for (let r = 0; r < 8; r++) {
    const rLabel = document.createElement('div');
    rLabel.className = 'board-coord-row';
    rLabel.textContent = ROWS[r];
    boardEl.appendChild(rLabel);

    for (let c = 0; c < 8; c++) {
      const idx = r * 8 + c;
      const stepNum = board[idx];
      const ch = text[idx] || '·';

      const cell = document.createElement('div');
      const isLight = (r + c) % 2 === 0;
      cell.className = `board-cell ${isLight ? 'light' : 'dark'}`;
      cell.id = `cell-step-${stepNum}`;

      if (highlightStep === stepNum) {
        cell.classList.add('active-step');
      } else if (highlightStep > 0 && stepNum < highlightStep) {
        cell.classList.add('visited');
      }

      cell.innerHTML = `
        <span class="step-num">${stepNum}</span>
        <span class="cell-char">${ch}</span>
      `;

      cell.title = `Casella ${COLS[c]}${ROWS[r]} | Passo: ${stepNum} | Lettera: ${ch}`;
      boardEl.appendChild(cell);
    }
  }

  // Riga inferiore coordinate colonne (a..h)
  const corner = document.createElement('div');
  corner.className = 'board-coord-col';
  boardEl.appendChild(corner);

  for (let c = 0; c < 8; c++) {
    const cLabel = document.createElement('div');
    cLabel.className = 'board-coord-col';
    cLabel.textContent = COLS[c];
    boardEl.appendChild(cLabel);
  }
}

function applyKtInstant() {
  stopKtAnim();
  const input = document.getElementById('kt-input');
  const cleaned = cleanInput(input.value);
  const resultBox = document.getElementById('kt-result');
  const stepInfo = document.getElementById('kt-step-badge');

  if (cleaned.length !== 64) {
    resultBox.textContent = `Richieste 64 lettere (${cleaned.length}/64 inserite)`;
    resultBox.style.color = 'var(--red)';
    stepInfo.textContent = 'Incompleto';
    return;
  }

  const board = getActiveBoard();
  const res = decodeKnightTour(cleaned, board);
  resultBox.textContent = res;
  resultBox.style.color = 'var(--green)';
  stepInfo.textContent = 'Decifrato ✓';
  updateKtBoardVisual();
}

function startKtAnimation() {
  stopKtAnim();
  const input = document.getElementById('kt-input');
  const cleaned = cleanInput(input.value);
  const resultBox = document.getElementById('kt-result');
  const stepInfo = document.getElementById('kt-step-badge');

  if (cleaned.length !== 64) {
    showToast('Inserisci esattamente 64 lettere');
    return;
  }

  const board = getActiveBoard();
  ktFullResult = decodeKnightTour(cleaned, board);
  ktCurrentStep = 1;
  ktAnimRunning = true;
  ktAnimPaused = false;
  updateKtPauseBtn();

  resultBox.textContent = '';
  resultBox.style.color = 'var(--gold-light)';

  runKtStepLoop();
}

function runKtStepLoop() {
  const speed = parseInt(document.getElementById('kt-speed').value, 10);
  const resultBox = document.getElementById('kt-result');
  const stepInfo = document.getElementById('kt-step-badge');

  currentKtTimer = setInterval(() => {
    if (ktCurrentStep > 64) {
      stopKtAnim();
      resultBox.style.color = 'var(--green)';
      stepInfo.textContent = 'Decifrato ✓';
      updateKtBoardVisual();
      return;
    }

    stepInfo.textContent = `Passo ${ktCurrentStep}/64`;
    resultBox.textContent = ktFullResult.slice(0, ktCurrentStep);
    updateKtBoardVisual(ktCurrentStep);
    ktCurrentStep++;
  }, speed);
}

function toggleKtPause() {
  if (!ktAnimRunning) return;

  if (ktAnimPaused) {
    // Riprendi dal passo corrente
    ktAnimPaused = false;
    updateKtPauseBtn();
    const stepInfo = document.getElementById('kt-step-badge');
    if (stepInfo) stepInfo.textContent = `Passo ${ktCurrentStep}/64`;
    runKtStepLoop();
  } else {
    // Metti in pausa
    if (currentKtTimer) {
      clearInterval(currentKtTimer);
      currentKtTimer = null;
    }
    ktAnimPaused = true;
    updateKtPauseBtn();
    const stepInfo = document.getElementById('kt-step-badge');
    if (stepInfo) {
      stepInfo.textContent = `Pausa (Passo ${Math.max(1, ktCurrentStep - 1)}/64)`;
    }
  }
}

function updateKtPauseBtn() {
  const pauseBtn = document.getElementById('kt-pause-btn');
  if (!pauseBtn) return;
  if (!ktAnimRunning) {
    pauseBtn.innerHTML = '⏸ Pausa';
    pauseBtn.classList.remove('btn-gold');
    pauseBtn.classList.add('btn-dim');
  } else if (ktAnimPaused) {
    pauseBtn.innerHTML = '▶ Riprendi';
    pauseBtn.classList.remove('btn-dim');
    pauseBtn.classList.add('btn-gold');
  } else {
    pauseBtn.innerHTML = '⏸ Pausa';
    pauseBtn.classList.remove('btn-gold');
    pauseBtn.classList.add('btn-dim');
  }
}

function stopKtAnim() {
  if (currentKtTimer) {
    clearInterval(currentKtTimer);
    currentKtTimer = null;
  }
  ktAnimRunning = false;
  ktAnimPaused = false;
  updateKtPauseBtn();
}

// ============================================================================
// 2. MOTORE VIGENÈRE (SOLO DECIFRATURA) & ANIMAZIONE SENZA OVERFLOW
// ============================================================================

function calculateVigenere(text, key) {
  const cleanT = cleanInput(text);
  const cleanK = cleanInput(key);

  if (!cleanT.length || !cleanK.length) {
    return { result: '', steps: [] };
  }

  let result = '';
  const steps = [];

  for (let i = 0; i < cleanT.length; i++) {
    const tChar = cleanT[i];
    const kChar = cleanK[i % cleanK.length];
    const tIdx = ALF25.indexOf(tChar);
    const kIdx = ALF25.indexOf(kChar);

    const resIdx = (tIdx + kIdx) % 25;
    const resChar = ALF25[resIdx];
    result += resChar;

    steps.push({
      idx: i,
      tChar,
      kChar,
      tIdx,
      kIdx,
      resIdx,
      resChar
    });
  }

  return { result, steps };
}

function onVigInputChange() {
  stopVigAnim();
  const text = document.getElementById('vig-text').value;
  const cleaned = cleanInput(text);
  const countEl = document.getElementById('vig-text-count');
  if (countEl) countEl.textContent = `${cleaned.length} lettere valide`;

  const resultBox = document.getElementById('vig-result');
  if (resultBox) resultBox.textContent = '—';

  const details = document.getElementById('vig-details');
  if (details) details.innerHTML = '';

  const animArea = document.getElementById('vig-anim-area');
  if (animArea) animArea.style.display = 'none';

  clearTabulaHighlight();
}

function setVigPreset(presetType) {
  const textEl = document.getElementById('vig-text');
  const keyEl = document.getElementById('vig-key');

  if (presetType === 'block1') {
    textEl.value = PARCHMENT_BLOCK_1;
    keyEl.value = 'MORTEPEE';
  }
  onVigInputChange();
}

function applyVigInstant() {
  stopVigAnim();
  const text = document.getElementById('vig-text').value;
  const key = document.getElementById('vig-key').value;
  const resultBox = document.getElementById('vig-result');
  const details = document.getElementById('vig-details');

  const { result } = calculateVigenere(text, key);

  if (!result.length) {
    resultBox.textContent = '—';
    details.innerHTML = '';
    return;
  }

  resultBox.textContent = result;
  details.innerHTML = '';
}

function startVigAnimation() {
  stopVigAnim();
  const text = document.getElementById('vig-text').value;
  const key = document.getElementById('vig-key').value;
  const animArea = document.getElementById('vig-anim-area');
  const resultBox = document.getElementById('vig-result');

  const { result, steps } = calculateVigenere(text, key);
  if (!steps.length) {
    showToast('Inserisci testo e chiave');
    return;
  }

  vigFullResult = result;
  vigSteps = steps;
  vigCurrentStep = 0;
  vigAnimRunning = true;
  vigAnimPaused = false;
  updateVigPauseBtn();

  animArea.style.display = 'block';
  resultBox.textContent = '';

  const textStrip = document.getElementById('va-text-strip');
  const keyStrip = document.getElementById('va-key-strip');
  const textWrap = document.getElementById('va-text-wrap');
  const keyWrap = document.getElementById('va-key-wrap');
  textStrip.innerHTML = '';
  keyStrip.innerHTML = '';

  // Centratura simmetrica: calcola padding orizzontale affinché le tessere possano trovarsi esattamente al centro
  const wrapW = (textWrap && textWrap.clientWidth) ? textWrap.clientWidth : 420;
  const centerPad = Math.max(10, Math.floor(wrapW / 2 - 15));
  textStrip.style.paddingLeft = centerPad + 'px';
  textStrip.style.paddingRight = centerPad + 'px';
  keyStrip.style.paddingLeft = centerPad + 'px';
  keyStrip.style.paddingRight = centerPad + 'px';

  steps.forEach((s, idx) => {
    const tTile = document.createElement('div');
    tTile.className = 'v-tile';
    tTile.id = `vt-tile-${idx}`;
    tTile.innerHTML = `<span class="tile-char">${s.tChar}</span>`;
    textStrip.appendChild(tTile);

    const kTile = document.createElement('div');
    kTile.className = 'v-tile';
    kTile.id = `vk-tile-${idx}`;
    kTile.innerHTML = `<span class="tile-char">${s.kChar}</span>`;
    keyStrip.appendChild(kTile);
  });

  if (textWrap) textWrap.scrollLeft = 0;
  if (keyWrap) keyWrap.scrollLeft = 0;

  runVigStepLoop();
}

function runVigStepLoop() {
  const formulaBox = document.getElementById('va-formula');
  const resultBox = document.getElementById('vig-result');
  const textWrap = document.getElementById('va-text-wrap');
  const keyWrap = document.getElementById('va-key-wrap');
  const speed = parseInt(document.getElementById('vig-speed').value, 10);

  currentVigTimer = setInterval(() => {
    if (vigCurrentStep >= vigSteps.length) {
      stopVigAnim();
      resultBox.textContent = vigFullResult;
      formulaBox.innerHTML = `<strong>Decifrazione completata!</strong> Totale lettere elaborate: ${vigSteps.length}`;
      showToast('Completato ✓');
      return;
    }

    document.querySelectorAll('.v-tile').forEach(t => t.classList.remove('active'));

    const s = vigSteps[vigCurrentStep];
    const tTile = document.getElementById(`vt-tile-${vigCurrentStep}`);
    const kTile = document.getElementById(`vk-tile-${vigCurrentStep}`);

    if (tTile) tTile.classList.add('active');
    if (kTile) kTile.classList.add('active');

    if (vigCurrentStep > 0) {
      const prevT = document.getElementById(`vt-tile-${vigCurrentStep - 1}`);
      const prevK = document.getElementById(`vk-tile-${vigCurrentStep - 1}`);
      if (prevT) prevT.classList.add('done');
      if (prevK) prevK.classList.add('done');
    }

    // Sincronizzazione precisa: scorrimento identico di entrambe le strisce per allineare al centro la lettera esaminata
    if (tTile && textWrap && keyWrap) {
      const wrapW = textWrap.clientWidth;
      const targetScroll = Math.max(0, tTile.offsetLeft - Math.floor(wrapW / 2) + Math.floor(tTile.offsetWidth / 2));
      const scrollBehavior = speed < 120 ? 'auto' : 'smooth';
      textWrap.scrollTo({ left: targetScroll, behavior: scrollBehavior });
      keyWrap.scrollTo({ left: targetScroll, behavior: scrollBehavior });
    }

    formulaBox.innerHTML = `
      Passo <strong>${vigCurrentStep + 1}/${vigSteps.length}</strong>: 
      Colonna Testo <strong>«${s.tChar}»</strong> ∩ Riga Chiave <strong>«${s.kChar}»</strong> 
      ➔ Lettera <strong>«${s.resChar}»</strong>
    `;

    resultBox.textContent = vigFullResult.slice(0, vigCurrentStep + 1);
    highlightTabula(s.kIdx, s.tIdx);

    vigCurrentStep++;
  }, speed);
}

function toggleVigPause() {
  if (!vigAnimRunning) return;

  if (vigAnimPaused) {
    // Riprendi dal passo corrente
    vigAnimPaused = false;
    updateVigPauseBtn();
    runVigStepLoop();
  } else {
    // Metti in pausa
    if (currentVigTimer) {
      clearInterval(currentVigTimer);
      currentVigTimer = null;
    }
    vigAnimPaused = true;
    updateVigPauseBtn();
    const formulaBox = document.getElementById('va-formula');
    if (formulaBox) {
      formulaBox.innerHTML = `<strong>In pausa</strong> al passo ${vigCurrentStep}/${vigSteps.length}. Clicca Riprendi per continuare.`;
    }
  }
}

function updateVigPauseBtn() {
  const pauseBtn = document.getElementById('vig-pause-btn');
  if (!pauseBtn) return;
  if (!vigAnimRunning) {
    pauseBtn.innerHTML = '⏸ Pausa';
    pauseBtn.classList.remove('btn-gold');
    pauseBtn.classList.add('btn-dim');
  } else if (vigAnimPaused) {
    pauseBtn.innerHTML = '▶ Riprendi';
    pauseBtn.classList.remove('btn-dim');
    pauseBtn.classList.add('btn-gold');
  } else {
    pauseBtn.innerHTML = '⏸ Pausa';
    pauseBtn.classList.remove('btn-gold');
    pauseBtn.classList.add('btn-dim');
  }
}

function stopVigAnim() {
  if (currentVigTimer) {
    clearInterval(currentVigTimer);
    currentVigTimer = null;
  }
  vigAnimRunning = false;
  vigAnimPaused = false;
  updateVigPauseBtn();
}

function sendVigToKt() {
  const vigRes = document.getElementById('vig-result').textContent.trim();
  if (!vigRes || vigRes === '—') {
    showToast('Nessun testo valido da inviare');
    return;
  }
  document.getElementById('kt-input').value = vigRes.slice(0, 64);
  switchTab('cavallo');
  showToast('Inviato al Salto del Cavallo');
  updateKtCharCount();
}

// ── TABULA RECTA 25x25 (PRIORATO DI SION) ──
function renderTabulaRecta() {
  const container = document.getElementById('tabula-container');
  if (!container || container.innerHTML.trim() !== '') return;

  const table = document.createElement('table');
  table.className = 'tabula-table';

  // Intestazione colonne
  const thead = document.createElement('thead');
  const hRow = document.createElement('tr');
  const cornerTh = document.createElement('th');
  cornerTh.textContent = 'K \\ C';
  hRow.appendChild(cornerTh);

  for (let c = 0; c < 25; c++) {
    const th = document.createElement('th');
    th.textContent = ALF25[c];
    th.id = `th-col-${c}`;
    th.title = `Colonna ${ALF25[c]} (Indice ${c})`;
    hRow.appendChild(th);
  }
  thead.appendChild(hRow);
  table.appendChild(thead);

  // Righe della tabella
  const tbody = document.createElement('tbody');
  for (let r = 0; r < 25; r++) {
    const row = document.createElement('tr');
    const rHeader = document.createElement('td');
    rHeader.textContent = ALF25[r];
    rHeader.id = `td-row-${r}`;
    rHeader.title = `Riga ${ALF25[r]} (Indice ${r})`;
    row.appendChild(rHeader);

    for (let c = 0; c < 25; c++) {
      const td = document.createElement('td');
      const charVal = ALF25[(r + c) % 25];
      td.textContent = charVal;
      td.id = `tab-cell-${r}-${c}`;
      td.title = `Chiave ${ALF25[r]} + Testo ${ALF25[c]} = ${charVal}`;

      td.onmouseenter = () => highlightTabula(r, c);
      td.onmouseleave = () => clearTabulaHighlight();

      row.appendChild(td);
    }
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  container.appendChild(table);
}

function highlightTabula(rowIdx, colIdx) {
  clearTabulaHighlight();
  const rHdr = document.getElementById(`td-row-${rowIdx}`);
  const cHdr = document.getElementById(`th-col-${colIdx}`);
  if (rHdr) rHdr.classList.add('highlight');
  if (cHdr) cHdr.classList.add('highlight');

  for (let c = 0; c < 25; c++) {
    const cCell = document.getElementById(`tab-cell-${rowIdx}-${c}`);
    if (cCell) cCell.classList.add('row-active');
  }
  for (let r = 0; r < 25; r++) {
    const rCell = document.getElementById(`tab-cell-${r}-${colIdx}`);
    if (rCell) rCell.classList.add('col-active');
  }

  const intersect = document.getElementById(`tab-cell-${rowIdx}-${colIdx}`);
  if (intersect) {
    intersect.classList.remove('row-active', 'col-active');
    intersect.classList.add('intersect');
  }
}

function clearTabulaHighlight() {
  document.querySelectorAll('.tabula-table .highlight, .tabula-table .intersect, .tabula-table .row-active, .tabula-table .col-active').forEach(el => {
    el.classList.remove('highlight', 'intersect', 'row-active', 'col-active');
  });
}

// Inizializzazione automatica
window.addEventListener('DOMContentLoaded', () => {
  renderTabulaRecta();
  updateKtBoardVisual();
  updateKtCharCount();
  onVigInputChange();
});
