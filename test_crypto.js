// test_crypto.js - Test suite for Vigenère & Knight's Tour (Priory of Sion)

const ALF25 = "ZABCDEFGHIJKLMNOPQRSTUVXY"; // Z=0, A=1, ..., Y=24 (no W)
const ALF26 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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

// 1. Vigenère Priorato
function vigenereEncode25(text, key) {
  const cleanT = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/W/g, 'V');
  const cleanK = key.toUpperCase().replace(/[^A-Z]/g, '').replace(/W/g, 'V');
  if (!cleanK.length) return cleanT;
  let out = '';
  for (let i = 0; i < cleanT.length; i++) {
    const ti = ALF25.indexOf(cleanT[i]);
    const ki = ALF25.indexOf(cleanK[i % cleanK.length]);
    const oi = (ti + ki) % 25;
    out += ALF25[oi];
  }
  return out;
}

function vigenereDecode25(text, key) {
  const cleanT = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/W/g, 'V');
  const cleanK = key.toUpperCase().replace(/[^A-Z]/g, '').replace(/W/g, 'V');
  if (!cleanK.length) return cleanT;
  let out = '';
  for (let i = 0; i < cleanT.length; i++) {
    const ti = ALF25.indexOf(cleanT[i]);
    const ki = ALF25.indexOf(cleanK[i % cleanK.length]);
    const oi = (ti - ki + 25) % 25;
    out += ALF25[oi];
  }
  return out;
}

// 2. Knight's Tour Permutations
// Mode Scatter: letter at index i goes to position (board[i] - 1)
function permuteScatter(text, board) {
  if (text.length !== 64) throw new Error(`Text length must be 64, got ${text.length}`);
  const out = new Array(64);
  for (let i = 0; i < 64; i++) {
    const dest = board[i] - 1;
    out[dest] = text[i];
  }
  return out.join('');
}

// Inverse of Scatter
function unpermuteScatter(text, board) {
  if (text.length !== 64) throw new Error(`Text length must be 64, got ${text.length}`);
  const out = new Array(64);
  for (let i = 0; i < 64; i++) {
    const dest = board[i] - 1;
    out[i] = text[dest];
  }
  return out.join('');
}

// Mode Gather: output letter at step k (0..63) is taken from cell where board[cell] == k + 1
function permuteGather(text, board) {
  if (text.length !== 64) throw new Error(`Text length must be 64, got ${text.length}`);
  const out = new Array(64);
  for (let k = 1; k <= 64; k++) {
    const src = board.indexOf(k);
    out[k - 1] = text[src];
  }
  return out.join('');
}

// Inverse of Gather
function unpermuteGather(text, board) {
  if (text.length !== 64) throw new Error(`Text length must be 64, got ${text.length}`);
  const out = new Array(64);
  for (let k = 1; k <= 64; k++) {
    const src = board.indexOf(k);
    out[src] = text[k - 1];
  }
  return out.join('');
}

// === EXECUTE TESTS ===
console.log('--- TEST 1: VIGENÈRE FRANCESCA TEST CASE ---');
const testC = 'VCPSJQRO';
const testK = 'MORTEPEE';
const expectedP = 'JRINOHXT';
const actualP = vigenereEncode25(testC, testK);
console.log(`Input: ${testC}, Key: ${testK}`);
console.log(`Expected: ${expectedP}`);
console.log(`Actual:   ${actualP}`);
if (actualP === expectedP) {
  console.log('✅ TEST 1 PASSED: Vigenère Encode matches Francesca case exactly!');
} else {
  console.error('❌ TEST 1 FAILED');
  process.exit(1);
}

const revertedC = vigenereDecode25(actualP, testK);
console.log(`Reverted decode: ${revertedC}`);
if (revertedC === testC) {
  console.log('✅ TEST 1b PASSED: Vigenère reversible!');
} else {
  console.error('❌ TEST 1b FAILED');
  process.exit(1);
}

console.log('\n--- TEST 2: BOARD 1 MAPPINGS ---');
console.log(`Pos 1 (index 0) -> board number: ${BOARD_1[0]} (expected 60)`);
console.log(`Pos 2 (index 1) -> board number: ${BOARD_1[1]} (expected 15)`);
console.log(`Pos 9 (index 8) -> board number: ${BOARD_1[8]} (expected 47)`);
if (BOARD_1[0] === 60 && BOARD_1[1] === 15 && BOARD_1[8] === 47) {
  console.log('✅ TEST 2 PASSED: Board 1 mappings match Francesca description!');
} else {
  console.error('❌ TEST 2 FAILED');
  process.exit(1);
}

console.log('\n--- TEST 3: BOARD 2 MAPPINGS ---');
console.log(`Pos 1 (index 0) -> board number: ${BOARD_2[0]} (expected 25)`);
console.log(`Pos 2 (index 1) -> board number: ${BOARD_2[1]} (expected 50)`);
console.log(`Pos 9 (index 8) -> board number: ${BOARD_2[8]} (expected 12)`);
if (BOARD_2[0] === 25 && BOARD_2[1] === 50 && BOARD_2[8] === 12) {
  console.log('✅ TEST 3 PASSED: Board 2 mappings match Francesca description!');
} else {
  console.error('❌ TEST 3 FAILED');
  process.exit(1);
}

console.log('\n--- TEST 4: BOARD 2 VERTICAL INVERSION ---');
let isFlip = true;
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    const s1Val = BOARD_1[r * 8 + c];
    const s2Val = BOARD_2[(7 - r) * 8 + c];
    if (s1Val !== s2Val) {
      isFlip = false;
      break;
    }
  }
}
if (isFlip) {
  console.log('✅ TEST 4 PASSED: Board 2 is mathematically exact vertical inversion of Board 1!');
} else {
  console.error('❌ TEST 4 FAILED');
  process.exit(1);
}

console.log('\n--- TEST 5: KNIGHT TOUR GEOMETRIC VALIDITY ---');
function checkKnightMoves(board, name) {
  const posMap = {};
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const step = board[r * 8 + c];
      posMap[step] = [r, c];
    }
  }
  // Check steps 1 to 63 -> step + 1
  for (let k = 1; k < 64; k++) {
    const [r1, c1] = posMap[k];
    const [r2, c2] = posMap[k + 1];
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    const valid = (dr === 1 && dc === 2) || (dr === 2 && dc === 1);
    if (!valid) {
      console.error(`Invalid knight move on ${name} between step ${k} (${r1},${c1}) and ${k+1} (${r2},${c2}): dr=${dr}, dc=${dc}`);
      return false;
    }
  }
  return true;
}

if (checkKnightMoves(BOARD_1, 'Board 1') && checkKnightMoves(BOARD_2, 'Board 2')) {
  console.log('✅ TEST 5 PASSED: Both Board 1 and Board 2 are 100% legal, valid Knight Tours!');
} else {
  console.error('❌ TEST 5 FAILED');
  process.exit(1);
}

console.log('\n--- TEST 6: PERMUTATION ROUNDTRIP ---');
const sample64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz!@';
const scat1 = permuteScatter(sample64, BOARD_1);
const unscat1 = unpermuteScatter(scat1, BOARD_1);
if (unscat1 === sample64) {
  console.log('✅ TEST 6a PASSED: Scatter mode reversible!');
} else {
  console.error('❌ TEST 6a FAILED');
  process.exit(1);
}

const gat1 = permuteGather(sample64, BOARD_1);
const ungat1 = unpermuteGather(gat1, BOARD_1);
if (ungat1 === sample64) {
  console.log('✅ TEST 6b PASSED: Gather mode reversible!');
} else {
  console.error('❌ TEST 6b FAILED');
  process.exit(1);
}

console.log('\nALL 6 CRITICAL TESTS PASSED PERFECTLY!');
