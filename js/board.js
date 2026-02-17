import { COLS, TOTAL_ROWS } from './constants.js';

// --------------------------------------------------
// Board state (0 = empty) - 2D array (TOTAL_ROWS x COLS)
// Buffer zone occupies rows 0 to 3 (hidden)
// Visible board occupies rows 4 to (TOTAL_ROWS - 1)
// --------------------------------------------------
export const board = Array.from({ length: TOTAL_ROWS }, () =>
  Array(COLS).fill(0),
);

// Check if a row is completely filled
function isRowComplete(row) {
  return row.every((cell) => cell !== 0);
}

// Check for completed lines and return their indices
export function getCompletedLines() {
  const completedLines = [];

  for (let y = 0; y < TOTAL_ROWS; y++) {
    if (isRowComplete(board[y])) {
      completedLines.push(y);
    }
  }

  return completedLines;
}

// Clear all completed lines and return the number cleared
// (lines cleared from bottom to top to maintain proper indices)
export function clearCompletedLines() {
  const completedLines = getCompletedLines();

  if (completedLines.length === 0) {
    return 0;
  }

  // Build new board with non-completed rows
  const newBoard = [];

  for (let y = 0; y < TOTAL_ROWS; y++) {
    if (!completedLines.includes(y)) {
      newBoard.push([...board[y]]);
    }
  }

  // Add empty rows at top for each cleared line
  const linesCleared = completedLines.length;
  for (let i = 0; i < linesCleared; i++) {
    newBoard.unshift(Array(COLS).fill(0));
  }

  // Replace board contents
  for (let y = 0; y < TOTAL_ROWS; y++) {
    board[y] = newBoard[y];
  }

  return linesCleared;
}

// Reset entire board to empty state
export function resetBoard() {
  for (let y = 0; y < TOTAL_ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      board[y][x] = 0;
    }
  }
}
