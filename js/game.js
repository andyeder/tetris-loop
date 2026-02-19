import {
  LOCK_DELAY,
  DAS,
  ARR,
  DAR,
  ARR_ROTATE,
  SCORING_TABLE,
  LINES_PER_LEVELUP,
} from './constants.js';
import {
  piece,
  collides,
  lockPiece,
  spawnPiece,
  rotatePieceClockwise,
  rotatePieceAntiClockwise,
  updateVisibility,
} from './piece.js';
import { moveState, rotationState, inputState, initInput } from './input.js';
import { getDropInterval } from './utils.js';
import { playAudio, playMusic, stopMusic } from './audio.js';

let dropTimer = 0;
let wasSoftDropping = false; // to track whether or not user was "soft-dropping"
let lockTimer = 0; // for lock-in (lock delay) timing

// Game state management
export const gameState = {
  score: 0,
  level: 1,
  linesCleared: 0,
  isGameOver: false,
  hasStarted: false,
};

function resetGame() {
  // Reset game state
  gameState.score = 0;
  gameState.level = 1;
  gameState.linesCleared = 0;
  gameState.isGameOver = false;
  gameState.hasStarted = true;
}

export function initGame() {
  resetGame();

  initInput();
  spawnPiece();
  playMusic('musGameplay');
}

// --------------------------------------------------
// Game over conditions (Tetris guideline)
// --------------------------------------------------

// "Block out" - when a piece spawns but IMMEDIATELY COLLIDES with locked pieces
function isBlockOut() {
  return collides(piece.x, piece.y);
}

// "Lock out" - piece locks entirely within the buffer zone
function isLockOut() {
  return !piece.hasEnteredVisibleArea;
}

// Game over check becomes trivial based on above
function isGameOver() {
  return isBlockOut() || isLockOut();
}

// Handle game over
function handleGameOver() {
  gameState.isGameOver = true;

  stopMusic('musGameplay');
  playAudio('sndGameOver');

  console.log('Game over! Final score:', gameState.score);
}

// --------------------------------------------------
// Score / level update - work-in-progress
// --------------------------------------------------
function updateScore(lines) {
  const prevLevel = gameState.level;

  // Standard Tetris scoring - multiplied by current level
  gameState.score += SCORING_TABLE[lines] * gameState.level;
  // Track total lines cleared
  gameState.linesCleared += lines;
  // Level up every LINES_PER_LEVELUP lines
  gameState.level = Math.floor(gameState.linesCleared / LINES_PER_LEVELUP) + 1;

  // Line(s) cleared or Level up sound
  if (gameState.level > prevLevel) {
    playAudio('sndLevelUp');
  } else {
    playAudio(`sndLineClear${lines === 4 ? '4' : ''}`);
  }
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
    playAudio('sndMove');
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
    state.repeat += dt;

    if (state.repeat >= ARR_ROTATE) {
      state.repeat -= ARR_ROTATE;
      tryRotate(dir);
    }
  }
}

function tryRotate(dir) {
  let didRotate = false;

  if (dir === 'antiClockwise') {
    didRotate = rotatePieceAntiClockwise();
  }

  if (dir === 'clockwise') {
    didRotate = rotatePieceClockwise();
  }

  if (didRotate) {
    playAudio('sndRotate');
  }
}

// --------------------------------------------------
// Execute the hard drop
// --------------------------------------------------
function hardDrop() {
  while (!collides(piece.x, piece.y + 1)) {
    piece.y++;
  }

  // Update visibility flag after ANY movement
  updateVisibility();

  const lines = lockPiece();
  if (lines > 0) {
    updateScore(lines);
  }

  if (isGameOver()) {
    handleGameOver();
    return;
  }

  // Reset timers so the next piece starts clean
  dropTimer = 0;
  lockTimer = 0;
  wasSoftDropping = false;
}

// --------------------------------------------------
// Main game update loop
// --------------------------------------------------
export function updateGame(dt) {
  if (gameState.isGameOver) {
    // Early out - game is over!
    return;
  }

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

  // Calculate drop interval based on current level
  const baseInterval = getDropInterval(gameState.level);
  const interval = softDropping ? baseInterval * 0.1 : baseInterval;

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

  // Update visibility flag after ANY movement
  updateVisibility();

  // If "grounded", count lock delay in real time
  if (collides(piece.x, piece.y + 1)) {
    lockTimer += dt;

    if (lockTimer >= LOCK_DELAY) {
      // lock delay met or exceeded - time to lock the piece into the board
      const lines = lockPiece();
      if (lines > 0) {
        updateScore(lines);
      }

      if (isGameOver()) {
        handleGameOver();
        return;
      }

      lockTimer = 0;
      dropTimer = 0;
      wasSoftDropping = false;
    }
  }
}
