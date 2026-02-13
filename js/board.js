import { ROWS, COLS } from './constants.js';

// --------------------------------------------------
// Board state (0 = empty) - 2D array (ROWS x COLS)
// --------------------------------------------------
export const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
