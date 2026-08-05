import { toggleDebugHUD } from './debug.js';

// --------------------------------------------------
// Hard drop (very different to soft drop!)
//  -> instantly moves piece as far down as possible
//  -> ignores "gravity" timing
//  -> bypasses lock delay
//  -> locks-in immediately on landing (no sliding)
//  -> NOT a fast soft drop (it's a different action)
// --------------------------------------------------

// Simple object to track input state
export const inputState = {
  hardDropRequested: false,
  down: false,
};

// Simple object to track left/right state
//  - use state like this so we can use DAS + AAR later
export const moveState = {
  left: { held: false, time: 0, repeat: 0 },
  right: { held: false, time: 0, repeat: 0 },
};

// Simple object to track left/right rotation
export const rotationState = {
  antiClockwise: { held: false, time: 0, repeat: 0 },
  clockwise: { held: false, time: 0, repeat: 0 },
};

let initialised = false;

export function initInput() {
  // initGame() runs again every time the player returns to the menu
  // and starts a new game, so guard against stacking up duplicate
  // listeners on each replay.
  if (initialised) {
    return;
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') moveState.left.held = true;
    if (e.key === 'ArrowRight') moveState.right.held = true;
    if (e.key === 'ArrowDown') inputState.down = true;

    if (e.code === 'Space') inputState.hardDropRequested = true;

    if (e.code === 'KeyZ') rotationState.antiClockwise.held = true;
    if (e.code === 'KeyX') rotationState.clockwise.held = true;

    // Toggle DEBUG HUD
    //  - a no-op where the screen is too small for it
    if (e.key === '~') {
      e.preventDefault();
      toggleDebugHUD();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') moveState.left.held = false;
    if (e.key === 'ArrowRight') moveState.right.held = false;
    if (e.key === 'ArrowDown') inputState.down = false;

    if (e.code === 'KeyZ') rotationState.antiClockwise.held = false;
    if (e.code === 'KeyX') rotationState.clockwise.held = false;
  });

  // A press that gets interrupted never delivers its keyup or
  // pointerup - alt-tab on desktop, an incoming call or a
  // notification on a phone. Without this the direction stays
  // held down and the piece slams into the wall on return.
  window.addEventListener('blur', resetInputStates);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resetInputStates();
    }
  });

  initialised = true;
}

export function resetInputStates() {
  inputState.hardDropRequested = false;
  inputState.down = false;
  moveState.left.held = false;
  moveState.left.time = 0;
  moveState.left.repeat = 0;
  moveState.right.held = false;
  moveState.right.time = 0;
  moveState.right.repeat = 0;
  rotationState.antiClockwise.held = false;
  rotationState.antiClockwise.time = 0;
  rotationState.antiClockwise.repeat = 0;
  rotationState.clockwise.held = false;
  rotationState.clockwise.time = 0;
  rotationState.clockwise.repeat = 0;
}
