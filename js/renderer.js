import { COLS, ROWS, BUFFER_ROWS, TOTAL_ROWS, CELLSIZE } from './constants.js';
import { board } from './board.js';
import { piece } from './piece.js';
import { gameState } from './game.js';

const GRID_BACKGROUND_COLOUR = 'oklch(0.3 0 0)';
const GRID_LINE_COLOUR = 'oklch(0.375 0 0)';
const BUFFER_ZONE_COLOUR = 'oklch(0.3 0.2 20 / 0.25)';

// Get canvas element/context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Check if debug HUD is visible
function isDebugMode() {
  const debugHud = document.getElementById('devHud');
  return debugHud && !debugHud.classList.contains('hidden');
}

// Setup canvas dimensions based on debug mode
function updateCanvasSize() {
  canvas.width = COLS * CELLSIZE;
  canvas.height = isDebugMode() ? TOTAL_ROWS * CELLSIZE : ROWS * CELLSIZE;
}

// Initial canvas setup
updateCanvasSize();

function drawCell(x, y, colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(x * CELLSIZE, y * CELLSIZE, CELLSIZE - 1, CELLSIZE - 1);
}

function drawGameHUD() {
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  set('score', gameState.score.toLocaleString());
  set('level', gameState.level);
  set('lines', gameState.linesCleared);
}

function drawGameOver() {
  // Darken the board
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // "GAME OVER" text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${CELLSIZE}px "Changa One", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - CELLSIZE);

  // Final score
  ctx.font = `${CELLSIZE * 0.6}px "Poppins", sans-serif`;
  ctx.fillText(
    `Score: ${gameState.score.toLocaleString()}`,
    canvas.width / 2,
    canvas.height / 2 + CELLSIZE * 0.25,
  );
}

export function render() {
  // Handle toggle to/from debug and display of buffer rows
  const showBufferRows = isDebugMode();

  // Update canvas size if debug mode changed
  updateCanvasSize();

  // Determine the rendering offset and range
  const startRow = showBufferRows ? 0 : BUFFER_ROWS;
  const endRow = showBufferRows ? TOTAL_ROWS : TOTAL_ROWS;
  const renderHeight = showBufferRows ? TOTAL_ROWS : ROWS;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw buffer zone background (only in debug mode)
  if (showBufferRows) {
    ctx.fillStyle = BUFFER_ZONE_COLOUR;
    ctx.fillRect(0, 0, canvas.width, BUFFER_ROWS * CELLSIZE);

    // Draw visible zone background
    ctx.fillStyle = GRID_BACKGROUND_COLOUR;
    ctx.fillRect(0, BUFFER_ROWS * CELLSIZE, canvas.width, ROWS * CELLSIZE);
  } else {
    // Draw visible zone background
    ctx.fillStyle = GRID_BACKGROUND_COLOUR;
    ctx.fillRect(0, 0, canvas.width, ROWS * CELLSIZE);
  }

  // Draw grid lines (full height width buffer)
  ctx.strokeStyle = GRID_LINE_COLOUR;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELLSIZE, 0);
    ctx.lineTo(x * CELLSIZE, renderHeight * CELLSIZE);
    ctx.stroke();
  }

  for (let y = 0; y <= renderHeight; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELLSIZE);
    ctx.lineTo(COLS * CELLSIZE, y * CELLSIZE);
    ctx.stroke();
  }

  // Draw locked cells
  for (let y = startRow; y < endRow; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        const renderY = showBufferRows ? y : y - BUFFER_ROWS;
        drawCell(x, renderY, board[y][x]);
      }
    }
  }

  // Draw active piece
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = piece.y + y;

        // Only draw if in visible range
        if (boardY >= startRow && boardY < endRow) {
          const renderY = showBufferRows ? boardY : boardY - BUFFER_ROWS;
          drawCell(piece.x + x, renderY, piece.colour);
        }
      }
    }
  }

  // Draw game over overlay (if applicable)
  if (gameState.isGameOver) {
    drawGameOver();
  }

  // Draw the game HUD
  drawGameHUD();
}
