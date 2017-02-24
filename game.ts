import { OutOfTurnError } from "./errors";

export type Player = number;

// Abstract class use to easily define and interact with any turned based game.
// See README.md for a detailed explanation on how to use this class.
export abstract class Game<O, M, E> {
  // Keeps track of which moves have already been submitted for this turn.
  private pendingMoves: Map<Player, M>;
  // The options for this instance of the game.
  protected options: O;
  // The random seed for this instance of the game.
  protected seed: string;

  constructor(options: any, seed: string = "") {
    this.seed = seed;
    this.options = this.sanitizeOptions(options);
    this.pendingMoves = new Map<Player, M>();
  }

  // Process input from the specified player.
  // This method does not need to be overriden by subclasses.
  // In fact, if you find yourself wanting to override this method, either there is an issue with
  // how the game class was designed (in which case, please contact me), you are not overriding the
  // sanitize*/assertMoveIsLegal/processTurn properly.
  playMove(move: any, player: Player): boolean {
    // Assert that the player can play a move this turn.
    let playersToPlayThisTurn: Set<Player> = this.getPlayersToPlay();
    if (playersToPlayThisTurn.size == 0) {
      throw new OutOfTurnError(move, player, "The game is already over");
    } else if (!playersToPlayThisTurn.has(player)) {
      throw new OutOfTurnError(move, player, "No legal moves this turn for this player");
    } else if (this.pendingMoves.has(player)) {
      throw new OutOfTurnError(move, player, "Player has already played this turn");
    }
    // Assert that the move is well formed.
    let sanitizedMove: M = this.sanitizeMove(move);
    // Assert that the move is legal.
    this.assertMoveIsLegal(sanitizedMove, player);
    // Remember the move until the remaining players have submited their moves for this turn.
    this.pendingMoves.set(player, sanitizedMove);
    if (this.getPlayersToPlay().size == this.pendingMoves.size) {
      // Once all players have submitted their moves, process the turn.
      this.processTurn(this.pendingMoves);
      this.pendingMoves = new Map<Player, M>();
      return true;
    }
    return false;
  }

  // Creates and returns a well formed object of type O from the options object.
  // Should throw an InvalidOptionsError if the options object is invalid.
  protected abstract sanitizeOptions(options: any): O;
  // Creates and returns a well formed object of type M from the move object.
  // Should throw an InvalidMoveError if the move object is invalid.
  protected abstract sanitizeMove(move: any): M;
  // Asserts that the specified move is currently legal for the specified player.
  // Should throw an IllegalMoveError if the move is not legal.
  // This method can assume that "move" is well formed.
  protected abstract assertMoveIsLegal(move: M, player: Player): void;
  // Play out the given moves.
  // This method can assume that the moves are all legal.
  protected abstract processTurn(moves: Map<Player, M>): void;

  // Returns a set containing which players need to play this turn.
  // If the set is empty, this means the game is over.
  abstract getPlayersToPlay(): Set<Player>;
  // Returns a set containing which players won the game.
  // Note: This set may be non-empty even if the game is not over (i.e. if the winners are the
  // first two players to reach 10 points and one player already reached 10 points) and may be empty
  // even if the game is over (i.e. if everybody lost in a cooperative game).
  abstract getWinners(): Set<Player>;
  // Returns a array of all turn events in order.
  abstract getTurnEvents(): Array<E>;
  // Returns a array of all turn events, as seen by the specified player, in order.
  // If player is not a valid player (i.e. -1), returns the turn events as seen by a spectator.
  abstract getTurnEventsAsSeenBy(player: Player): Array<E>;
  // Returns the latest turn events.
  abstract getLatestTurnEvents(): E;
  // Returns the latest turn events as seen by the specified player.
  // If player is not a valid player (i.e. -1), returns the turn events as seen by a spectator.
  abstract getLatestTurnEventsAsSeenBy(player: Player): E;
}

export type GenericGame = Game<any, any, any>;
