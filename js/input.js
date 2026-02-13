// --------------------------------------------------
// TODO: Implement this...
// Hard drop (very different to soft drop!)
//  -> instantly moves piece as far down as possible
//  -> ignores "gravity" timing
//  -> bypasses lock delay
//  -> locks-in immediately on landing (no sliding)
//  -> NOT a fast soft drop (it's a different action)
// --------------------------------------------------

// Simple object to track input state
export const inputState = {
  hardDropRequested: false,
  down: false,
};

// Simple object to track left/right state
//  - use state like this so we can use DAS + AAR later
export const moveState = {
  left: { held: false, wasHeld: false /* time: 0, repeat: 0 */ },
  right: { held: false, wasHeld: false /* time: 0, repeat: 0 */ },
};

export function initInput() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') moveState.left.held = true;
    if (e.key === 'ArrowRight') moveState.right.held = true;
    if (e.key === 'ArrowDown') inputState.down = true;

    if (e.code === 'Space') inputState.hardDropRequested = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') moveState.left.held = false;
    if (e.key === 'ArrowRight') moveState.right.held = false;
    if (e.key === 'ArrowDown') inputState.down = false;
  });
}
