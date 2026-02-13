// --------------------------------------------------
// Grid configuration - 10x20 is 'standard' Tetris
// --------------------------------------------------
const COLS = 10;
const ROWS = 20;
const CELLSIZE = 32;

// --------------------------------------------------
// Classic Tetrominoes - I/O/T/S/Z/J/L
//  - defines shapes AND standardised colours
//
// Based on "standard" rules, shapes spawn:
//  - J, L, T: flat side facing downward
//  - I, S, Z: in their upper horizontal orientation
//  - O: in its only orientation (2x2 square)
//
// Where pieces spawn on entry to board:
//  - I, O: centre
//  - J, L, T, S, Z: shifted slightly left
// --------------------------------------------------
const TETROMINOES = [
  // I - Cyan
  {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    colour: '#00F0F0',
  },

  // O - Yellow
  {
    shape: [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    colour: '#F0F000',
  },

  // T - Purple
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    colour: '#A000F0',
  },

  // S - Green
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    colour: '#00F000',
  },

  // Z - Red
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    colour: '#F00000',
  },

  // J - Blue
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    colour: '#0050F0',
  },

  // L - Orange
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    colour: '#F0A000',
  },
];

// --------------------------------------------------
// Fixed-step timing
// --------------------------------------------------
const FIXED_DT = 1 / 60;
const DROP_INTERVAL = 0.5; // seconds per row

// --------------------------------------------------
// TODO: Implement this...
// Lock delay
// Period after which piece touches the stack and can
// still be moved/rotated before being locked-in
// --------------------------------------------------
const LOCK_DELAY = 0.5; // seconds

// --------------------------------------------------
// TODO: Implement this...
// DAS / AAR ("official" Tetris terms!)
// Decouples the movement - i.e. NOT frame-based
//
// DAS (Delayed Auto Shift)
//  - the delay before horizontal movement repeats
// AAR (Auto Repeat Rate)
//  - how fast the piece moves after DAS has elapsed
//
// Basically...
//  - Press direction to move once
//  - Wait DAS
//  - Then move every ARR
//
// Values typically used in Tetris
//  - "modern" Tetris
//   -> DAS = 0.15
//   -> AAR = 0.05
//  - "hyper/competitive" Tetris
//   -> DAS = 0.10
//   -> AAR = 0 (instant slide!)
// --------------------------------------------------
const MOVE_INTERVAL = 0.15; // seconds
const DAS = 0.15; // seconds
const ARR = 0.05; // seconds

export {
  COLS,
  ROWS,
  CELLSIZE,
  FIXED_DT,
  DROP_INTERVAL,
  MOVE_INTERVAL,
  // LOCK_DELAY,
  // DAS,
  // ARR,
  TETROMINOES,
};
