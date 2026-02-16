import { FIXED_DT, SIMULATION_RATE_HZ } from './constants.js';

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
