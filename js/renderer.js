import { COLS, ROWS, CELLSIZE } from './constants.js';
import { board } from './board.js';
import { piece } from './piece.js';

const GRID_BACKGROUND_COLOUR = '#3F3F3F';

// Get canvas element/context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Setup canvas dimensions
canvas.width = COLS * CELLSIZE;
canvas.height = ROWS * CELLSIZE;

function drawCell(x, y, colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(x * CELLSIZE, y * CELLSIZE, CELLSIZE - 1, CELLSIZE - 1);
}

export function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw grid background
  ctx.strokeStyle = GRID_BACKGROUND_COLOUR;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELLSIZE, 0);
    ctx.lineTo(x * CELLSIZE, ROWS * CELLSIZE);
    ctx.stroke();
  }

  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELLSIZE);
    ctx.lineTo(COLS * CELLSIZE, y * CELLSIZE);
    ctx.stroke();
  }

  // Draw locked cells
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        drawCell(x, y, board[y][x]);
      }
    }
  }

  // Draw active piece
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        drawCell(piece.x + x, piece.y + y, piece.colour);
      }
    }
  }
}
