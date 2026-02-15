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
- Spawns pieces using "7-bag" randomisation (refill + shuffle)
- Added lock-delay - the period between a piece grounding and being locked-in (during which a player can still move left/right)
- Added DAS + ARR movement (https://tetris.wiki/DAS)

## TODO List

- Add logic to clear completed lines and update board
- Tetromino/piece rotation with "wall kick" tables using SRS (https://tetris.wiki/Super_Rotation_System)
- Add scoring and level progression
- Add basic UI

## Controls

| **Action** | **Key**     |
| :--------- | :---------- |
| Left       | Arrow Left  |
| Right      | Arrow Right |
| Soft-drop  | Arrow Down  |
| Hard-drop  | Space       |
| Restart :) | F5          |
