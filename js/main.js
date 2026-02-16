import { initGame, updateGame } from './game.js';
import { FIXED_DT, MAX_FRAME_TIME } from './constants.js';
import { render } from './renderer.js';
import { updateDebugHUD } from './debug.js';

let lastTime = performance.now() / 1000;
let accumulator = 0;
let debugTotalSteps = 0;

function frame() {
  const now = performance.now() / 1000;
  let delta = now - lastTime;
  lastTime = now;

  let debugClamped = false;

  // Clamp large frame deltas to avoid "spiral of death"
  //  - may be introduced by tab-switch, heavy OS operations, etc.
  if (delta > MAX_FRAME_TIME) {
    delta = MAX_FRAME_TIME;
    debugClamped = true;
  }

  accumulator += delta;

  let debugStepsThisFrame = 0;

  while (accumulator >= FIXED_DT) {
    updateGame(FIXED_DT);
    accumulator -= FIXED_DT;

    debugStepsThisFrame++;
    debugTotalSteps++;
  }

  // TODO: for interpolation (although no plans to use it here)
  // const alpha = accumulator / FIXED_DT;

  render(/*alpha*/);

  updateDebugHUD(
    delta,
    accumulator,
    debugStepsThisFrame,
    debugTotalSteps,
    debugClamped,
  );

  requestAnimationFrame(frame);
}

initGame();
requestAnimationFrame(frame);
