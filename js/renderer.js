import { COLS, ROWS, BUFFER_ROWS, TOTAL_ROWS, CELLSIZE } from './constants.js';
import { board } from './board.js';
import { piece } from './piece.js';
import { gameState } from './game.js';
import { peekNextTetromino } from './utils.js';
import { isDebugMode } from './debug.js';

const GRID_BACKGROUND_COLOUR = 'oklch(0.3 0 0)';
const GRID_LINE_COLOUR = 'oklch(0.375 0 0)';
const BUFFER_ZONE_COLOUR = 'oklch(0.3 0.2 20 / 0.25)';

// Get canvas element/context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Preview canvas element/context
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');

// --------------------------------------------------
// Device pixel ratio
//
// A backing store sized in CSS pixels looks soft on a high-DPI
// display. Scale it by the device ratio and scale the drawing
// context to match, so everything below still draws in board
// coordinates and knows nothing about DPI.
//
// Capped at 2 - beyond that the extra pixels cost fill rate
// without being visible.
// --------------------------------------------------
const DPR = Math.min(window.devicePixelRatio || 1, 2);

// Preview canvas units (4x4 cells plus padding)
const PREVIEW_CELL_SIZE = CELLSIZE / 2;
const PREVIEW_CANVAS_PADDING = CELLSIZE / 2;
const PREVIEW_SIZE = 4 * PREVIEW_CELL_SIZE + PREVIEW_CANVAS_PADDING;

// --------------------------------------------------
// Display size
//
// The stylesheet owns how big each canvas is drawn; this module only
// matches the backing store to whatever that works out to, so both
// stay sharp at any size - phone, desktop or tablet.
//
// Observed rather than read from clientWidth each frame, which would
// force a synchronous layout inside the render loop.
//
// Only the width is tracked - the height is derived from it, so the
// backing store's ratio matches the drawing exactly rather than
// being a rounded pixel off and quietly distorting the cells.
// --------------------------------------------------
let displayWidth = 0;
let previewDisplayWidth = 0;

function observeWidth(element, onWidth) {
  new ResizeObserver((entries) => {
    for (const entry of entries) {
      const box = entry.contentBoxSize?.[0];

      onWidth(box ? box.inlineSize : entry.contentRect.width);
    }
  }).observe(element);
}

observeWidth(canvas, (width) => {
  displayWidth = width;
});

observeWidth(previewCanvas, (width) => {
  previewDisplayWidth = width;
});

// Resize a canvas's backing store to match its displayed size, and
// scale its context so drawing carries on in the canvas's own units
// - board cells for one, preview cells for the other.
function syncBackingStore(element, context, cssWidth, unitWidth, unitHeight) {
  const backingWidth = Math.round(cssWidth * DPR);
  const backingHeight = Math.round(backingWidth * (unitHeight / unitWidth));

  // Assigning width/height wipes the canvas and resets the context,
  // transform included - so only do it when the size has actually
  // changed, rather than on every single frame.
  if (element.width === backingWidth && element.height === backingHeight) {
    return;
  }

  element.width = backingWidth;
  element.height = backingHeight;

  const scale = backingWidth / unitWidth;

  context.setTransform(scale, 0, 0, scale, 0, 0);
}

let lastRows = 0;

// Setup canvas dimensions based on debug mode
function updateCanvasSize() {
  const rows = isDebugMode() ? TOTAL_ROWS : ROWS;

  // Hand CSS the board's shape. Stating the ratio explicitly is what
  // keeps this from being circular: the displayed size must not
  // depend on the backing store we are about to derive from it.
  if (rows !== lastRows) {
    lastRows = rows;
    canvas.style.setProperty('--board-aspect', `${COLS} / ${rows}`);
  }

  // Fall back to the nominal size until the observer has reported,
  // so the first frame is not drawn into a 0x0 canvas.
  syncBackingStore(
    canvas,
    ctx,
    displayWidth || COLS * CELLSIZE,
    COLS * CELLSIZE,
    rows * CELLSIZE,
  );
}

function updatePreviewCanvasSize() {
  syncBackingStore(
    previewCanvas,
    previewCtx,
    previewDisplayWidth || PREVIEW_SIZE,
    PREVIEW_SIZE,
    PREVIEW_SIZE,
  );
}

// Initial canvas setup
updateCanvasSize();

// Draw a single cell at a specific position with given colour
function drawCell(x, y, colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(x * CELLSIZE, y * CELLSIZE, CELLSIZE - 1, CELLSIZE - 1);
}

// Draw a single cell at a specific position with given colour and size
//  - use this for "next piece preview"
function drawCellAt(context, x, y, size, colour) {
  context.fillStyle = colour;
  context.fillRect(x, y, size - 1, size - 1);
}

function drawNextPiecePreview() {
  updatePreviewCanvasSize();

  const next = peekNextTetromino();

  if (!next) {
    return;
  }

  // Clear preview canvas
  //  - in board coordinates, not backing-store pixels
  previewCtx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

  // Calculate centering offset for the piece
  const shapeHeight = next.shape.length;
  const shapeWidth = next.shape[0].length;

  // Count actual filled rows/cols to center properly
  let minY = shapeHeight,
    maxY = 0,
    minX = shapeWidth,
    maxX = 0;
  for (let y = 0; y < shapeHeight; y++) {
    for (let x = 0; x < shapeWidth; x++) {
      if (next.shape[y][x]) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
  }

  const filledWidth = maxX - minX + 1;
  const filledHeight = maxY - minY + 1;
  const offsetX =
    PREVIEW_CANVAS_PADDING / 2 + ((4 - filledWidth) * PREVIEW_CELL_SIZE) / 2;
  const offsetY =
    PREVIEW_CANVAS_PADDING / 2 + ((4 - filledHeight) * PREVIEW_CELL_SIZE) / 2;

  // Draw the piece
  for (let y = 0; y < shapeHeight; y++) {
    for (let x = 0; x < shapeWidth; x++) {
      if (next.shape[y][x]) {
        const px = offsetX + (x - minX) * PREVIEW_CELL_SIZE;
        const py = offsetY + (y - minY) * PREVIEW_CELL_SIZE;
        drawCellAt(previewCtx, px, py, PREVIEW_CELL_SIZE, next.colour);
      }
    }
  }
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

export function render() {
  // Handle toggle to/from debug and display of buffer rows
  const showBufferRows = isDebugMode();

  // Update canvas size if debug mode changed
  updateCanvasSize();

  // Determine the rendering offset and range
  const startRow = showBufferRows ? 0 : BUFFER_ROWS;
  const endRow = showBufferRows ? TOTAL_ROWS : TOTAL_ROWS;
  const renderHeight = showBufferRows ? TOTAL_ROWS : ROWS;

  // Board coordinates, not backing-store pixels - the context is
  // scaled by DPR, so canvas.width/height would be wrong here.
  const boardWidth = COLS * CELLSIZE;

  ctx.clearRect(0, 0, boardWidth, renderHeight * CELLSIZE);

  // Draw buffer zone background (only in debug mode)
  if (showBufferRows) {
    ctx.fillStyle = BUFFER_ZONE_COLOUR;
    ctx.fillRect(0, 0, boardWidth, BUFFER_ROWS * CELLSIZE);

    // Draw visible zone background
    ctx.fillStyle = GRID_BACKGROUND_COLOUR;
    ctx.fillRect(0, BUFFER_ROWS * CELLSIZE, boardWidth, ROWS * CELLSIZE);
  } else {
    // Draw visible zone background
    ctx.fillStyle = GRID_BACKGROUND_COLOUR;
    ctx.fillRect(0, 0, boardWidth, ROWS * CELLSIZE);
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

  // Draw "next piece preview"
  drawNextPiecePreview();

  // Show/hide game over DOM overlay
  const gameOverScreen = document.getElementById('gameOverScreen');
  if (gameOverScreen) {
    if (gameState.isGameOver) {
      gameOverScreen.classList.remove('hidden');

      // Update final score display
      const finalScore = document.getElementById('finalScore');
      if (finalScore) {
        finalScore.textContent = gameState.score.toLocaleString();
      }
    } else {
      gameOverScreen.classList.add('hidden');
    }
  }

  // Draw the game HUD
  drawGameHUD();
}
