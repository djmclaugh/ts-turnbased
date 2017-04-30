# Turned Based Game Abstract Base Class

## Introduction
While building [OSASG](https://github.com/djmclaugh/OSASG), I realized that I would like to separate that project into three independent projects: The server, the client, and the bots. However, all three of these components have to process games in some way or another. I’m therefore creating a game package these three components can depend on.

## Supported Mechanics
Ideally, this supports all conceivable turned based games. That includes:
* Any positive number of players (including single player games)
* Supports options (i.e. Hex can be played on a 13x13 board or a 15x15 board)
* Seeded randomness
* Hidden information
* Simultaneous turns

If there’s a turned based game mechanics that can’t be implemented, then there is a design flaw, please contact me (i.e. I originally made the mistake of always exposing a player’s moves to everyone not realizing that the moves themselves could also be hidden information).

## How to use
// TODO Update this section if other people actually start using this.

Have a look at test/simple_game.ts for an example.
If you are implementing an abstract strategy game, you can also use the AbstractStrategyGame class instead which is simpler to extend. See test/tictactoe.ts for an example.

Note: This is only the logic to run the game. To actually play your game in a browser you’ll also have to write something that creates and updates a UI based on the “turn events” the game outputs.
