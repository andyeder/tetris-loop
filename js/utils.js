import { TETROMINOES } from './constants.js';

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
