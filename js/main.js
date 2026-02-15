import { initGame, updateGame } from './game.js';
import { FIXED_DT, MAX_FRAME_TIME } from './constants.js';
import { render } from './renderer.js';

let lastTime = performance.now() / 1000;
let accumulator = 0;

function frame() {
  const now = performance.now() / 1000;
  let delta = now - lastTime;
  lastTime = now;

  // Clamp large frame deltas to avoid "spiral of death"
  //  - may be introduced by tab-switch, heavy OS operations, etc.
  delta = Math.min(delta, MAX_FRAME_TIME);

  accumulator += delta;

  while (accumulator >= FIXED_DT) {
    updateGame(FIXED_DT);
    accumulator -= FIXED_DT;
  }

  // TODO: for interpolation (although no plans to use it here)
  // const alpha = accumulator / FIXED_DT;

  render(/*alpha*/);
  requestAnimationFrame(frame);
}

initGame();
requestAnimationFrame(frame);
