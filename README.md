# tetris-loop (Tetris Basics)

I'm not sure why I called it "tetris-loop", but it is what it is! This is my interpretation of the fundamental elements that go into writing a Tetris-like game. Game loop, movement, etc.

## Tech Stack

Nothing special - just the following:

- HTML5 (rendering to canvas)
- CSS (basic styling)
- Javascript (module)

## Features (kinda sorta)

- Fixed step updates
- Render decoupled from game logic
- Based on "modern" Tetris conventions - colours, timings, etc.
- Supports left/right movement (basic)
- Support for "soft-drop" and "hard-drop"
- Spawns pieces using "7-bag" randomisation (refill + shuffle) - https://tetris.wiki/Random_Generator and https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
- Added lock-delay - the period between a piece grounding and being locked-in (during which a player can still move left/right)
- Added DAS + ARR movement (https://tetris.wiki/DAS)
- Added debug HUD - toggle with '~' (tilde) key
- Tetromino/piece rotation with "wall kick" tables using SRS (https://tetris.wiki/Super_Rotation_System)
- Clears completed lines and updates board
- Added basic scoring and level progression (level increases every N lines cleared - typically 10)
- Added basic game HUD
- Add piece spawning in a non-rendered buffer zone atop the board (viewable in debug mode)
- Game over detection

## TODO List

- Increase drop speed as level increases
- Nice to have - "Next piece" preview
- Nice to have - sounds effects / music
- Nice to have - score / leaderboard
- Nice to have - make mobile friendly

## Controls

| **Action** | **Key**     |
| :--------- | :---------- |
| Left       | Arrow Left  |
| Right      | Arrow Right |
| Soft-drop  | Arrow Down  |
| Hard-drop  | Space       |
| Restart :) | F5          |
