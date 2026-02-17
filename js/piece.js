import { getNextTetromino } from './utils.js';
import { board, clearCompletedLines } from './board.js';
import {
  COLS,
  BUFFER_ROWS,
  TOTAL_ROWS,
  WALL_KICK_TESTS_JLSTZ,
  WALL_KICK_TESTS_I,
} from './constants.js';

// --------------------------------------------------
// Current (active) piece / Tetromino
// --------------------------------------------------
export let piece = {
  shape: [],
  colour: '',
  x: 0,
  y: 0,
  isVisible: false, // true once ANY FILLED CELL of the shape reaches visible area of play board
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
  const tetromino = getNextTetromino();
  piece.shape = cloneTetrominoShape(tetromino.shape);
  piece.colour = tetromino.colour;
  // Spawn locations based on Tetris guidelines and baked in Tetrominoes data
  piece.x = tetromino.spawnX;
  piece.y = tetromino.spawnY;
  piece.isVisible = false; // Must reset on each spawn

  orientationState = 0; // Reset to default (spawn) orientation
}

// --------------------------------------------------
// Rotation system - SRS (Super Rotation System)
//  - this is based on "Modern Tetris"
// --------------------------------------------------

// Track current orientation state (0 = spawn, R = right, 2 = 180, L = left)
export let orientationState = 0; // 0, 1, 2, 3 representing 0, R, 2, L
const rotationNames = ['0', 'R', '2', 'L'];

// The rotations are standard mathematical transforms
// Both rotateShapeClockwise and rotateShapeAntiClockwise
//  - create empty NxN grid
//  - loop through each cell in original
//  - apply transformation to map old coords to new
//
// Difference is in the transformation formula:
//  - clockwise     : [y][x] -> [x][N-1-y]
//  - anticlockwise : [y][x] -> [N-1-x][y]
//
// Formulas are transposes with different axis flips

// Rotate a shape matrix 90 degrees clockwise
function rotateShapeClockwise(shape) {
  const N = shape.length;
  const rotated = Array.from({ length: N }, () => Array(N).fill(0));

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      rotated[x][N - 1 - y] = shape[y][x];
    }
  }

  return rotated;
}

// Rotate a shape matrix 90 degrees anti-clockwise
function rotateShapeAntiClockwise(shape) {
  const N = shape.length;
  const rotated = Array.from({ length: N }, () => Array(N).fill(0));

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      rotated[N - 1 - x][y] = shape[y][x];
    }
  }

  return rotated;
}

// Get the appropriate kick table for the current piece
//  - does not account for the O piece as this rotates in-place
function getKickTable() {
  const shapeSize = piece.shape.length;

  // I piece (4x4)
  if (shapeSize === 4) {
    return WALL_KICK_TESTS_I;
  }

  // All others (3x3): J, L, S, T, Z
  return WALL_KICK_TESTS_JLSTZ;
}

// Return true if the current piece is an O piece
function isOPiece() {
  return piece.shape.length === 3 && piece.shape[0].length === 4;
}

// Attempt to rotate the piece clockwise with wall kicks
export function rotatePieceClockwise() {
  if (isOPiece()) {
    // Indicate successful rotation (no-op) - O piece rotates in-place
    return true;
  }

  const rotatedShape = rotateShapeClockwise(piece.shape);
  const oldState = orientationState;
  const newState = (orientationState + 1) % 4;

  const kickTable = getKickTable();
  const kickKey = `${rotationNames[oldState]}->${rotationNames[newState]}`;
  const tests = kickTable[kickKey];

  // Try each wall kick offset
  for (const [offsetX, offsetY] of tests) {
    const testX = piece.x + offsetX;
    const testY = piece.y + offsetY;

    // Temporarily update piece to test collision
    const originalShape = piece.shape;
    const originalX = piece.x;
    const originalY = piece.y;

    piece.shape = rotatedShape;
    piece.x = testX;
    piece.y = testY;

    if (!collides(testX, testY)) {
      // Success! Keep the rotation
      orientationState = newState;
      return true;
    }

    // Restore original values for next test
    piece.shape = originalShape;
    piece.x = originalX;
    piece.y = originalY;
  }

  // All tests failed, rotation blocked
  return false;
}

// Attempt to rotate the piece anti-clockwise with wall kicks
export function rotatePieceAntiClockwise() {
  if (isOPiece()) {
    // Indicate successful rotation (no-op) - O piece rotates in-place
    return true;
  }

  const rotatedShape = rotateShapeAntiClockwise(piece.shape);
  const oldState = orientationState;
  const newState = (orientationState + 3) % 4; // +3 is same as -1 in mod 4

  const kickTable = getKickTable();
  const kickKey = `${rotationNames[oldState]}->${rotationNames[newState]}`;
  const tests = kickTable[kickKey];

  // Try each wall kick offset
  for (const [offsetX, offsetY] of tests) {
    const testX = piece.x + offsetX;
    const testY = piece.y + offsetY;

    // Temporarily update piece to test collision
    const originalShape = piece.shape;
    const originalX = piece.x;
    const originalY = piece.y;

    piece.shape = rotatedShape;
    piece.x = testX;
    piece.y = testY;

    if (!collides(testX, testY)) {
      // Success! Keep the rotation
      orientationState = newState;
      return true;
    }

    // Restore original values for next test
    piece.shape = originalShape;
    piece.x = originalX;
    piece.y = originalY;
  }

  // All tests failed, rotation blocked
  return false;
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

      if (
        gx < 0 ||
        gx >= COLS ||
        gy >= TOTAL_ROWS ||
        (gy >= 0 && board[gy][gx])
      ) {
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
        board[piece.y + y][piece.x + x] = piece.colour;
      }
    }
  }

  // Clear completed lines (return count to caller)
  const linesCleared = clearCompletedLines();

  // Respawn piece
  spawnPiece();

  return linesCleared;
}

// Check if any filled cell has reached the visible area
// and latch the flag - once true it stays true for this piece
export function updateVisibility() {
  if (piece.isVisible) {
    // Early out - already true
    return;
  }

  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x] && piece.y + y >= BUFFER_ROWS) {
        piece.hasEnteredVisibleArea = true;
        return;
      }
    }
  }
}
