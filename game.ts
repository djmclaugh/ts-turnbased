import { OutOfTurnError } from "./errors";

export type Player = number;

// An update is information about anything that happens between decisions (i.e. What move did my
// opponent play or what is the outcome of the pair of dice I just rolled).
// It should contain information visible to everyone while the i-th element of the "privateInfo"
// array should contain information visible to player i only.
// There should be enough information without the privateInfo field to be able to replay the game
// from a spectator's point of view.
// Furthermore, there should also be enough information in "privateInfo[i]" (and the rest of the
// non-private information) so that player i can know exactly their legal moves at all times.
export interface Update {
  publicInfo: any
  privateInfo?: ReadonlyArray<any>
}

// Abstract class use to easily define and interact with any turned based game.
// See README.md for a detailed explanation on how to use this class.
export abstract class Game {
  // Keeps track of which moves have already been submitted for this turn.
  private pendingMoves: Map<Player, any>;
  // Keeps track of all of the updates.
  // Note: The i-th update represents the events between the (i-1)th turn and the i-th turn. This
  // means that the 0-th update represents the setup information (i.e. Which cards did I draw at the
  // start of the game, before anyone played any move whatsoever).
  private updates: Array<Update> = [];
  // The options for this instance of the game.
  protected options: any;

  constructor(options: any) {
    this.options = this.sanitizeOptions(options);
    this.pendingMoves = new Map<Player, any>();
  }

  // Initializes the game and populates the first update.
  start(seed: string = ""): void {
    if (this.updates.length > 0) {
      throw new Error("A game can only be started once");
    }
    this.updates.push(this.initialize(seed));
  }

  // Process input from the specified player.
  // Returns false if the game is still waiting for other turns before being able to progress,
  // returns true if the game progressed.
  playMove(move: any, player: Player): boolean {
    // Assert that the player can play a move this turn.
    if (this.updates.length == 0) {
      throw new OutOfTurnError(player, "The game hasn't started yet");
    }
    let playersToPlayThisTurn: Set<Player> = this.getPlayersToPlay();
    if (playersToPlayThisTurn.size == 0) {
      throw new OutOfTurnError(player, "The game is already over");
    } else if (!playersToPlayThisTurn.has(player)) {
      throw new OutOfTurnError(player, "No legal moves this turn for this player");
    } else if (this.pendingMoves.has(player)) {
      throw new OutOfTurnError(player, "Player has already played this turn");
    }
    // Assert that the move is well formed.
    let sanitizedMove = this.sanitizeMove(move);
    // Assert that the move is legal.
    this.assertMoveIsLegal(sanitizedMove, player);
    // Remember the move until the remaining players have submited their moves for this turn.
    this.pendingMoves.set(player, sanitizedMove);
    if (this.getPlayersToPlay().size == this.pendingMoves.size) {
      // Once all players have submitted their moves, process the turn.
      this.updates.push(this.processTurn(this.pendingMoves));
      this.pendingMoves = new Map<Player, any>();
      return true;
    }
    return false;
  }

  // Returns an array of all turn events in order.
  getAllUpdates(): ReadonlyArray<Update> {
    return this.updates;
  }
  
  // Returns the latest turn events.
  getLatestUpdate(): Update {
    return this.updates[this.updates.length -1];
  }

  // Creates and returns a new, valid, object to be used as the games options.
  // Should throw an InvalidOptionsError if the options object is invalid.
  protected abstract sanitizeOptions(options: any): any;
  // Creates and returns a new, valid, object to be used a a player move.
  // Should throw an InvalidMoveError if the move object is invalid.
  protected abstract sanitizeMove(move: any): any;
  // Asserts that the specified move is currently legal for the specified player.
  // Should throw an IllegalMoveError if the move is not legal.
  // This method can assume that "move" is well formed (it will be the return value of a
  // sanitizeMove call).
  protected abstract assertMoveIsLegal(move: any, player: Player): void;
  // Set up the game with the provided random seed (i.e. determine who goes first or distribute the 
  // first hand of cards).
  protected abstract initialize(seed: string): Update;
  // Play out the given moves.
  // This method can assume that the moves are all valid and legal.
  protected abstract processTurn(moves: Map<Player, any>): Update;

  // Returns a set containing which players need to play this turn.
  // If the set is empty, this means the game is over.
  abstract getPlayersToPlay(): Set<Player>;
  // Returns a set containing which players won the game.
  // Note: This set may be non-empty even if the game is not over (i.e. if the winners are the
  // first two players to reach 10 points and one player already reached 10 points) and may be empty
  // even if the game is over (i.e. if everybody lost in a cooperative game).
  abstract getWinners(): Set<Player>;
}
