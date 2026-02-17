import { DROP_INTERVAL, LOCK_DELAY, DAS, ARR, DAR } from './constants.js';
import {
  piece,
  collides,
  lockPiece,
  spawnPiece,
  rotatePieceClockwise,
  rotatePieceAntiClockwise,
} from './piece.js';
import { moveState, rotationState, inputState, initInput } from './input.js';
import { clearCompletedLines } from './board.js';

let dropTimer = 0;
let wasSoftDropping = false; // to track whether or not user was "soft-dropping"
let lockTimer = 0; // for lock-in (lock delay) timing

export function initGame() {
  initInput();
  spawnPiece();
}

// --------------------------------------------------
// Movement handling
// --------------------------------------------------
function updateLateralMovement(dt) {
  handleLateralMovement('left', -1, dt);
  handleLateralMovement('right', 1, dt);
}

function handleLateralMovement(dir, dx, dt) {
  const state = moveState[dir];

  if (!state.held) {
    // movement key released - reset
    state.time = 0;
    state.repeat = 0;
    return;
  }

  state.time += dt;

  // Immediate lateral move on press
  if (state.time === dt) {
    tryLateralMove(dx);
    return;
  }

  // Auto-repeat phase only if already >= DAS timer
  if (state.time >= DAS) {
    if (ARR === 0) {
      // Instant slide (special case for certain game types - akin to a "lateral hard-drop")
      while (!collides(piece.x + dx, piece.y)) {
        piece.x += dx;
        lockTimer = 0; // IMPORTANT: reset lock timer when free moving (no collision)
      }
    } else {
      state.repeat += dt;

      if (state.repeat >= ARR) {
        state.repeat -= ARR;
        tryLateralMove(dx);
      }
    }
  }
}

function tryLateralMove(dx) {
  if (!collides(piece.x + dx, piece.y)) {
    piece.x += dx;
    lockTimer = 0; // IMPORTANT: reset lock timer when free moving (no collision)
  }
}

// --------------------------------------------------
// Rotation handling
// --------------------------------------------------
function updateRotation(dt) {
  handleRotation('antiClockwise', dt);
  handleRotation('clockwise', dt);
}

function handleRotation(dir, dt) {
  const state = rotationState[dir];

  if (!state.held) {
    state.time = 0;
    state.repeat = 0;
    return;
  }

  state.time += dt;

  // Immediate move on press
  if (state.time === dt) {
    tryRotate(dir);
    return;
  }

  // Auto-repeat - if already >= DAR time
  if (state.time >= DAR) {
    if (ARR === 0) {
    } else {
      state.repeat += dt;

      if (state.repeat >= ARR) {
        state.repeat -= ARR;
        tryRotate(dir);
      }
    }
  }
}

function tryRotate(dir) {
  if (dir === 'antiClockwise') {
    rotatePieceAntiClockwise();
  }

  if (dir === 'clockwise') {
    rotatePieceClockwise();
  }
}

// --------------------------------------------------
// Execute the hard drop
// --------------------------------------------------
function hardDrop() {
  while (!collides(piece.x, piece.y + 1)) {
    piece.y++;
  }

  lockPiece();

  // Reset timers so the next piece starts clean
  dropTimer = 0;
  lockTimer = 0;
}

// --------------------------------------------------
// Main game update loop
// --------------------------------------------------
export function updateGame(dt) {
  // Important - hard drop takes priority!
  if (inputState.hardDropRequested) {
    hardDrop();
    inputState.hardDropRequested = false;
    return; // no more processing this tick, start clean on next tick
  }

  // Process lateral (left/right) movement
  updateLateralMovement(dt);

  // Process rotational movement
  updateRotation(dt);

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

  //*******************************************************
  // NOW... this poses an interesting problem...
  // The code block below was originally:
  //
  // while (dropTimer >= interval)...
  //
  // This is physically correct. HOWEVER, in hindsight, it
  // isn't the way that Tetris works and may cause unexpected
  // behaviour under certain circumstances (if the game hitches/lags).
  //
  // The better option might be to use a single-step by changing to:
  //
  // if (dropTimer >= interval)...
  //
  // Whilst not physically correct, it is Tetris game-rule correct.
  // The while loops ensures physics correctness but is arguably
  // not right for grid-based/discrete games like Tetris. The
  // while loop runs "simulation time" but Tetris is "game rule time".
  // "Gravity" needs to behave as a single-step movement, not a physics
  // catch-up system.
  //
  // NOTE: The fixed step accumulator remains as is, only the line above changes.
  // This means DAS/ARR and lock delay timing remains consistent, and it
  // remains independent of frame rate.
  //*******************************************************
  // while (dropTimer >= interval) {
  if (dropTimer >= interval) {
    dropTimer -= interval;

    if (!collides(piece.x, piece.y + 1)) {
      piece.y++;
      lockTimer = 0; // reset lock delay if falling
    } else {
      // piece is "grounded" - but don't lock-in yet!
      // break;
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

  // Check for completed lines
  const linesCleared = clearCompletedLines();
  if (linesCleared > 0) {
    // TODO: update score, level progression, etc.
  }
}
