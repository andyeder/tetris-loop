import { board } from './board.js';
import { COLS, ROWS, TETROMINOES } from './constants.js';

// --------------------------------------------------
// Current (active) piece / Tetromino
// --------------------------------------------------
export let piece = {
  shape: [],
  colour: '',
  x: 0,
  y: 0,
};

// --------------------------------------------------
// Clone shape to avoid mutating original definition!
//  - oops, let's do this now, will become inmportant
//    later when we start rotating pieces...
// --------------------------------------------------
function cloneTetrominoShape(shape) {
  return shape.map((row) => [...row]);
}

// --------------------------------------------------
// Spawn a 'random' Tetromino piece (not random yet!)
// --------------------------------------------------
export function spawnPiece() {
  const tetromino = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
  piece.shape = cloneTetrominoShape(tetromino.shape);
  piece.colour = tetromino.colour;
  piece.x = 3;
  piece.y = 0;
}

// --------------------------------------------------
// Collision test
// --------------------------------------------------
export function collides(px, py) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (!piece.shape[y][x]) continue;

      const gx = px + x;
      const gy = py + y;

      if (gx < 0 || gx >= COLS || gy >= ROWS || (gy >= 0 && board[gy][gx])) {
        return true;
      }
    }
  }
  return false;
}

// --------------------------------------------------
// Lock piece into board
// --------------------------------------------------
export function lockPiece() {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        // TODO: Store colour info in the board (will need board structure update)
        board[piece.y + y][piece.x + x] = 1;
      }
    }
  }

  // Respawn piece
  spawnPiece();
}
