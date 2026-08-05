import { FIXED_DT, SIMULATION_RATE_HZ } from './constants.js';

// --------------------------------------------------
// Debug HUD availability
//
// Debug mode needs room it does not have on a phone: the panel
// sits over the board, and turning it on also reveals the spawn
// buffer rows, which makes the board taller and squeezes it again.
//
// So it is offered only where there is space, keyed to the same
// breakpoint the stacked layout uses in css/style.css. Owning both
// the availability test and the toggle here keeps the renderer and
// the input handler from drifting apart on what "debug" means.
// --------------------------------------------------
const debugViewport = window.matchMedia('(width >= 34rem)');

function getHud() {
  return document.getElementById('devHud');
}

export function isDebugAvailable() {
  return debugViewport.matches;
}

// True only when the HUD is genuinely on screen. The renderer asks
// this before drawing the buffer rows, so both halves of debug mode
// switch together.
export function isDebugMode() {
  if (!isDebugAvailable()) {
    return false;
  }

  const hud = getHud();

  return hud !== null && !hud.classList.contains('hidden');
}

export function toggleDebugHUD() {
  if (!isDebugAvailable()) {
    return;
  }

  const hud = getHud();

  if (hud) {
    hud.classList.toggle('hidden');
  }
}

// Shrinking the window below the breakpoint while the HUD is open
// would otherwise leave it stranded across the board.
debugViewport.addEventListener('change', (e) => {
  if (!e.matches) {
    const hud = getHud();

    if (hud) {
      hud.classList.add('hidden');
    }
  }
});

// For debugging purposes
const MAX_FRAME_SAMPLES = 120;
const frameTimes = [];

export function updateDebugHUD(
  frameTime,
  accumulator,
  stepsThisFrame,
  totalSteps,
  clamped,
) {
  //-------------------------------------------------------
  // Calculate FPS
  //-------------------------------------------------------
  const frameDurationMs = frameTime * 1000;
  frameTimes.push(frameDurationMs);
  if (frameTimes.length > MAX_FRAME_SAMPLES) {
    frameTimes.shift();
  }

  const avgFrame = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
  const fps = 1000 / avgFrame;

  //-------------------------------------------------------
  // Calculate alpha (interpolator)
  //-------------------------------------------------------
  const alpha = accumulator / FIXED_DT;

  //-------------------------------------------------------
  // Set DOM element values
  //-------------------------------------------------------
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  set('simulationRateHz', SIMULATION_RATE_HZ.toFixed(2));
  set('fps', fps.toFixed(2));
  set('delta', frameDurationMs.toFixed(2));
  set('accumulator', accumulator.toFixed(4));
  set('steps', stepsThisFrame);
  set('totalSteps', totalSteps);
  set('alpha', alpha.toFixed(2));
  set('clamped', clamped ? 'YES' : 'no');
}
