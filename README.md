# tetris-loop (Tetris, basically...)

I started out by writing a simple Tetris-like game loop having been inspired by a close friend and colleague, [TGJG (github)](https://github.com/TracyGJG), who was/is working on a functional programming version of the game that runs both text-based and browser/canvas-based. _My interpretation doesn't use FP and is only designed for the browser!_

However, I got a bit carried away and the result is a _pretty much_ complete version of Tetris. I have based it on guidelines for "modern" Tetris (more information provided below). Be forewarned, the game is not mobile-friendly right now... so best to run it in your preferred browser!

You can play it online [here](https://andyeder.uk/tetris).

## Game Controls

| **Action**            | **Key**                |
| :-------------------- | :--------------------- |
| Left and Right        | Arrow Left and Right   |
| Soft / Hard Drop      | Arrow Down / Space Bar |
| Rotate Left and Right | Z and X                |
| Restart :)            | F5                     |

## Tech Stack

- HTML5 (rendering to canvas)
- CSS (basic styling)
- Javascript (module)

## Features

- Render decoupled from game logic, fixed-step game updates (defaults to 60Hz)
- Based on "modern" Tetris conventions - colours, timings, scoring, level progression
- Supports "soft drop" and "hard drop"
- Supports "lock delay" - the period between a piece grounding and being locked-in (during which a player can still control the Tetromino)
- Spawns pieces using "7-bag" randomisation (refill + shuffle) - https://tetris.wiki/Random_Generator and https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
- Uses DAS + ARR movement (https://tetris.wiki/DAS)
- Tetromino rotation with "wall kick" tables using SRS (https://tetris.wiki/Super_Rotation_System)
- Simple game HUD
- Debug HUD (I will leave this in)
- Spawns using a buffer zone atop the board (viewable in debug mode)
- "Next piece" preview and "Game Over" detection
- Sounds effects / music (which can be toggled on/off independently)

## Todo List

- Nice to have - user-defined controls
- Nice to have - mobile friendly :)
