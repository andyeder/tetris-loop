import { DROP_INTERVAL, MOVE_INTERVAL, LOCK_DELAY } from './constants.js';
import { piece, collides, lockPiece, spawnPiece } from './piece.js';
import { moveState, inputState, initInput } from './input.js';

let dropTimer = 0;
let wasSoftDropping = false; // to track whether or not user was "soft-dropping"
let lockTimer = 0; // for lock-in (lock delay) timing
let moveTimer = 0; // will be replaced when DAS + ARR implemented

export function initGame() {
  initInput();
  spawnPiece();
}

// Execute the hard drop
function hardDrop() {
  while (!collides(piece.x, piece.y + 1)) {
    piece.y++;
  }

  lockPiece();

  // Reset timers so the next piece starts clean
  dropTimer = 0;
  lockTimer = 0;
}

export function updateGame(dt) {
  // Important - hard drop takes priority!
  if (inputState.hardDropRequested) {
    hardDrop();
    inputState.hardDropRequested = false;
    return; // no more processing this tick, start clean on next tick
  }

  // TODO: implement DAS + ARR for Tetris style movement
  const movingLeft = moveState.left.held;
  const movingRight = moveState.right.held;

  // Immediate move when key is first pressed - important to feel responsive
  if (movingLeft && !moveState.left.wasHeld) {
    if (!collides(piece.x - 1, piece.y)) {
      piece.x--;
      lockTimer = 0;
    }
    moveTimer = 0;
  } else if (movingRight && !moveState.right.wasHeld) {
    if (!collides(piece.x + 1, piece.y)) {
      piece.x++;
      lockTimer = 0;
    }
    moveTimer = 0;
  }

  // Repeated left/right movement whilst held
  moveTimer += dt;

  if (moveTimer >= MOVE_INTERVAL) {
    moveTimer = 0;

    if (movingLeft && !collides(piece.x - 1, piece.y)) {
      piece.x--;
      lockTimer = 0;
    } else if (movingRight && !collides(piece.x + 1, piece.y)) {
      piece.x++;
      lockTimer = 0;
    }
  }

  // Track previous held state
  moveState.left.wasHeld = movingLeft;
  moveState.right.wasHeld = movingRight;

  // Soft-drop state handling
  //  - ensure we set drop timer to zero on a change of soft drop state
  //  - this prevents erratic piece movement!
  const softDropping = inputState.down;
  if (softDropping !== wasSoftDropping) {
    dropTimer = 0; // discard accumulated time
    wasSoftDropping = softDropping;
  }

  // "Gravity" (and lock delay)
  dropTimer += dt;
  const interval = softDropping ? DROP_INTERVAL * 0.1 : DROP_INTERVAL;

  while (dropTimer >= interval) {
    dropTimer -= interval;

    if (!collides(piece.x, piece.y + 1)) {
      piece.y++;
      lockTimer = 0; // reset lock delay if falling
    } else {
      // piece is "grounded" - but don't lock-in yet!
      break;
    }
  }

  // If "grounded", count lock delay in real time
  if (collides(piece.x, piece.y + 1)) {
    lockTimer += dt;

    if (lockTimer >= LOCK_DELAY) {
      // lock delay met or exceeded - time to lock the piece into the board
      lockPiece();
      lockTimer = 0;
    }
  }
}
