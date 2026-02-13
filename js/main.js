import { initGame, updateGame } from './game.js';
import { FIXED_DT } from './constants.js';
import { render } from './renderer.js';

let lastTime = performance.now() / 1000;
let accumulator = 0;

function frame() {
  const now = performance.now() / 1000;
  let delta = now - lastTime;
  lastTime = now;

  accumulator += delta;

  while (accumulator >= FIXED_DT) {
    updateGame(FIXED_DT);
    accumulator -= FIXED_DT;
  }

  render();
  requestAnimationFrame(frame);
}

initGame();
requestAnimationFrame(frame);
