import {
  TETROMINOES,
  BASE_DROP_INTERVAL,
  MIN_DROP_INTERVAL,
  DROP_DECAY_RATE,
} from './constants.js';

// --------------------------------------------------
// 7-Bag Randomisation - apparently, modern Tetris
//  uses this in the name of fairness (to avoid the
//  use of Math.random where you might get 5 'S' in a
//  row, or 30 pieces without an 'I', or a brutal
//  drought of certain shapes!)
//
// Algorithm (something like this):
//   - Put one of each of the 7 shapes in a 'bag'
//   - Shuffle the bag
//   - Deal pieces one by one
//   - When empty, refill bag and reshuffle
// This guarantees:
//   - Player always gets all 7 pieces within 7 spawns
//   - No extreme droughts
//   - Improved play feel without being unfair
//
// The algorithm uses a Fisher-Yates shuffle
// How does it work?
//
// [Backwards through the array, last index down to zero]
// For each position i:
//  1. Pick random index j from 0 to i
//  2. Swap element i with element j
//
// By stepping backwards, everything AFTER i is
//  already locked in place
//
// More info: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
// --------------------------------------------------
let sevenBag = [];

function shuffleBag(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function refillBag() {
  sevenBag = [...TETROMINOES];
  shuffleBag(sevenBag);
}

export function getNextTetromino() {
  if (sevenBag.length === 0) {
    refillBag();
  }
  return sevenBag.pop();
}

// --------------------------------------------------
// Drop speed calculations (implementing two methods)
//  1. Naive time-based (simple exponential)
//  2. "Classic" based on frames per drop, converted to secs
// --------------------------------------------------

// 1. Simple exponential - purely time-based
export function getDropIntervalSimple(level) {
  const interval = BASE_DROP_INTERVAL * Math.pow(DROP_DECAY_RATE, level - 1);
  return Math.max(interval, MIN_DROP_INTERVAL);
}

// Method 2: "Classic" Tetris formula
// Based on frames per drop at 60fps, converted to seconds
export function getDropIntervalClassic(level) {
  // Original formula (assumes 60fps): frames per drop = (11 - level)^0.9 * 5
  const framesPerDrop = Math.pow(11 - Math.min(level, 10), 0.9) * 5;

  // Convert frames (at 60fps) to seconds
  // ALWAYS / 60 regardless of SIMULATION_RATE_HZ as formula assumes 60fps timing
  const interval = framesPerDrop / 60;

  return Math.max(interval, MIN_DROP_INTERVAL);
}

// Choose desired drop intervbal method...
//export const getDropInterval = getDropIntervalSimple;
export const getDropInterval = getDropIntervalClassic;
