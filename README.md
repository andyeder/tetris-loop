# tetris-loop (Tetris Basics)

I'm not sure why I called it "tetris-loop", but it is what it is! This is my interpretation of the fundamental elements that go into writing a Tetris-like game. Game loop, movement, etc.

#### Tech Stack

Nothing special - just the following:

- HTML5 (rendering to canvas)
- CSS (basic styling)
- Javascript (module)

#### Features (kinda sorta)

- Fixed step updates
- Render decoupled from game logic
- Based on "modern" Tetris conventions - colours, timings, etc.
- Supports left/right movement (basic) + "soft-drop" at the moment

#### TODO List

- Add "hard-drop" support
- Add Tetromino/piece rotation
- Add logic to clear completed lines and update board
- Add 7-bag (refill + shuffle) randomisation (spawn)
- Add DAS + ARR movement
- Add "wall kick" tables
- Add scoring and level progression
- Add basic UI
