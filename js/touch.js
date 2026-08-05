// --------------------------------------------------
// On-screen touch controls
//
// These write to exactly the same state objects that the
// keyboard handlers in input.js use, so DAS/ARR, lock delay
// and rotation repeat all behave identically. game.js does
// not know - or need to know - where a press came from.
//
// Buttons are matched by their data-control attribute rather
// than by id, so the markup can be rearranged freely.
// --------------------------------------------------

import { inputState, moveState, rotationState } from './input.js';

// Held controls - press and hold to auto-repeat, exactly like
// holding a key down.
const HELD_CONTROLS = {
  left: (held) => {
    moveState.left.held = held;
  },
  right: (held) => {
    moveState.right.held = held;
  },
  rotateLeft: (held) => {
    rotationState.antiClockwise.held = held;
  },
  rotateRight: (held) => {
    rotationState.clockwise.held = held;
  },
  softDrop: (held) => {
    inputState.down = held;
  },
};

// One-shot controls - fire once per press. game.js consumes and
// clears the flag, just as it does for the space bar.
const TAP_CONTROLS = {
  hardDrop: () => {
    inputState.hardDropRequested = true;
  },
};

let initialised = false;

function bindHeldControl(button, setHeld) {
  button.addEventListener('pointerdown', (e) => {
    e.preventDefault();

    // Capture the pointer so a finger that slides off the button
    // still delivers its pointerup here. Without this the release
    // is lost and the direction stays held down forever.
    button.setPointerCapture(e.pointerId);

    setHeld(true);
    button.classList.add('is-pressed');
  });

  const release = (e) => {
    if (button.hasPointerCapture(e.pointerId)) {
      button.releasePointerCapture(e.pointerId);
    }

    setHeld(false);
    button.classList.remove('is-pressed');
  };

  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
}

function bindTapControl(button, fire) {
  button.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    fire();
  });
}

export function initTouchInput() {
  if (initialised) {
    return;
  }

  const controls = document.getElementById('touchControls');

  if (!controls) {
    return;
  }

  for (const button of controls.querySelectorAll('[data-control]')) {
    const name = button.dataset.control;

    if (HELD_CONTROLS[name]) {
      bindHeldControl(button, HELD_CONTROLS[name]);
    } else if (TAP_CONTROLS[name]) {
      bindTapControl(button, TAP_CONTROLS[name]);
    }
  }

  initialised = true;
}
