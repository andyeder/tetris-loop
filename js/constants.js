// --------------------------------------------------
// Grid configuration - 10x20 is 'standard' Tetris
//  - we also add a 4-row spawn buffer (not drawn)
// --------------------------------------------------
const COLS = 10;
const ROWS = 20;
const BUFFER_ROWS = 4;
const TOTAL_ROWS = ROWS + BUFFER_ROWS;
const CELLSIZE = 32;

// --------------------------------------------------
// Classic Tetrominoes - I/O/T/S/Z/J/L
//  - defines shapes AND standardised colours AND spawn points
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
    colour: 'oklch(0.9 0.1534 195)',
    spawnX: 3,
    spawnY: 2,
  },

  // O - Yellow
  {
    shape: [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    colour: 'oklch(0.9676 0.21 109.77)',
    spawnX: 3,
    spawnY: 3,
  },

  // T - Purple
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    colour: 'oklch(0.597 0.2851 307.1079)',
    spawnX: 3,
    spawnY: 3,
  },

  // S - Green
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    colour: 'oklch(0.8705 0.2829 142.4953)',
    spawnX: 3,
    spawnY: 3,
  },

  // Z - Red
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    colour: 'oklch(0.6382 0.247 29.23)',
    spawnX: 3,
    spawnY: 3,
  },

  // J - Blue
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    colour: 'oklch(0.55 0.2474 262.59)',
    spawnX: 3,
    spawnY: 3,
  },

  // L - Orange
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    colour: 'oklch(0.8088 0.1628 73.41)',
    spawnX: 3,
    spawnY: 3,
  },
];

// --------------------------------------------------
// Fixed-step timing
// --------------------------------------------------
const SIMULATION_RATE_HZ = 60;
const FIXED_DT = 1 / SIMULATION_RATE_HZ;

const BASE_DROP_INTERVAL = 1.0; // baseline drop rate (seconds per row)
const DROP_DECAY_RATE = 0.9; // decrease by ~10% per level
const MIN_DROP_INTERVAL = 0.05; // cap at 50ms (to prevent impossibly fast drop speeds)

// The max frame time cap is used to prevent "spiral of death"
//  in the event that frame hitches/lag become too large
const MAX_FRAME_TIME = 0.25; // seconds

// --------------------------------------------------
// Lock delay
// Period after which piece touches the stack and can
// still be moved/rotated before being locked-in
// --------------------------------------------------
const LOCK_DELAY = 0.5; // seconds

// --------------------------------------------------
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
//   -> AAR = 0 (instant slide, "lateral hard-drop"!)
// --------------------------------------------------
const DAS = 0.15; // seconds
const DAR = 0.1; // seconds (made this term up!)
const ARR = 0.05; // seconds

// --------------------------------------------------
// SRS Wall Kick Data - Modern Tetris
// Based on: https://tetris.wiki/Super_Rotation_System
//
// The keys should be interpreted as follows:
// (0 = spawn, R = right, 2 = 180, L = left)
// --------------------------------------------------

// For J, L, S, T, Z pieces
const WALL_KICK_TESTS_JLSTZ = {
  // rotation_from -> rotation_to: [[x, y], ...]
  '0->R': [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  'R->0': [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  'R->2': [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  '2->R': [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  '2->L': [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  'L->2': [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  'L->0': [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  '0->L': [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
};

// For I piece (different kick table)
const WALL_KICK_TESTS_I = {
  '0->R': [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  'R->0': [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  'R->2': [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
  '2->R': [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  '2->L': [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  'L->2': [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  'L->0': [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  '0->L': [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
};

// --------------------------------------------------
// Scoring table for when lines are cleared
// 1 line = 100, 2 lines = 300, 3 lines = 500, 4 lines = 800 (Tetris!)
// (usually multiplied by current level)
// --------------------------------------------------
const SCORING_TABLE = [0, 100, 300, 500, 800];

const LINES_PER_LEVELUP = 10;

export {
  COLS,
  ROWS,
  BUFFER_ROWS,
  TOTAL_ROWS,
  CELLSIZE,
  FIXED_DT,
  BASE_DROP_INTERVAL,
  MIN_DROP_INTERVAL,
  DROP_DECAY_RATE,
  MAX_FRAME_TIME,
  SIMULATION_RATE_HZ,
  LOCK_DELAY,
  DAS,
  ARR,
  TETROMINOES,
  DAR,
  WALL_KICK_TESTS_JLSTZ,
  WALL_KICK_TESTS_I,
  SCORING_TABLE,
  LINES_PER_LEVELUP,
};
