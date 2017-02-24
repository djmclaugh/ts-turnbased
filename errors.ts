// Error to throw if a game is being initialized with invalid options.
export class InvalidOptionsError extends Error {
  constructor(options: any, reason: string) {
    let message: string = `Invalid options: ${reason}\n${JSON.stringify(options)}`;
    super(message);
  }
}

// Error to throw if a move doesn't have the right format for the game.
// That is the move could never be a legal move regardless of options and current game state.
// (i.e. missing fields, wrong data types, etc.)
export class InvalidMoveError extends Error {
  constructor(move: any, reason: string) {
    let message: string = `Invalid move: ${reason}\n${JSON.stringify(move)}`;
    super(message);
  }
}

// Error to throw if a move is not currently legal for the specified player.
export class IllegalMoveError extends Error {
  constructor(move: any, player: number, reason: string) {
    let message: string = `Illegal move by player ${player}: ${reason}\n${JSON.stringify(move)}`;
    super(message);
  }
}

// Error to throw if a player tries to play out of turn.
export class OutOfTurnError extends Error {
  constructor(move: any, player: number, reason: string) {
    let message: string =
        `Out of turn play by player ${player}: ${reason}\n${JSON.stringify(move)}`;
    super(message);
  }
}
