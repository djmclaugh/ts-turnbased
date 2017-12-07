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
export interface Update<PU, PR> {
  publicInfo: PU
  toPlay: Array<Player>
  winners?: Array<Player>
  privateInfo?: Array<PR>
}

export type PublicUpdate<PU> = Update<PU, null>;

// Abstract class use to easily define and interact with any turned based game.
// See README.md for a detailed explanation on how to use this class.
export abstract class Game<O, M, PU, PR> {
  // Keeps track of which moves have already been submitted for this turn.
  private pendingMoves: Map<Player, M>;
  // Keeps track of all of the updates.
  // Note: The i-th update represents the events between the (i-1)th turn and the i-th turn. This
  // means that the 0-th update represents the setup information (i.e. Which cards did I draw at the
  // start of the game, before anyone played any move whatsoever).
  private updates: Array<Update<PU, PR>> = [];
  // The options for this instance of the game.
  protected options: O;
  // The number of players participating in the game.
  public readonly numberOfPlayers: number;

  constructor(options: O) {
    this.options = this.sanitizeOptions(options);
    this.numberOfPlayers = this.numberOfPlayersForOptions(options);
    this.pendingMoves = new Map();
  }

  // Initializes the game and populates the first update.
  public start(seed: string = ""): void {
    if (this.updates.length > 0) {
      throw new Error("A game can only be started once");
    }
    let update: Update<PU, PR> = this.initialize(seed);
    // Technically, the game can be over at the very begining...
    if (update.toPlay.length == 0) {
      update.winners = this.getWinners();
    }
    this.updates.push(update);
  }

  // Process input from the specified player.
  // Returns false if the game is still waiting for other turns before being able to progress,
  // returns true if the game progressed.
  public playMove(move: M, player: Player): boolean {
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
      let update: Update<PU, PR> = this.processTurn(this.pendingMoves);
      if (update.toPlay.length == 0) {
        update.winners = this.getWinners();
      }
      this.updates.push(update);
      this.pendingMoves = new Map<Player, M>();
      return true;
    }
    return false;
  }

  // Returns an array of all turn events in order.
  public getAllUpdates(): Array<Update<PU, PR>> {
    return this.updates;
  }

  // Returns the latest turn events.
  public getLatestUpdate(): Update<PU, PR> {
    if (this.updates.length == 0) {
      throw new Error("Game hasn't started yet");
    }
    return this.updates[this.updates.length - 1];
  }

  // Returns a set containing which players need to play this turn.
  // If the set is empty, this means the game hasn't started or is over.
  public getPlayersToPlay(): Set<Player> {
    if (this.updates.length) {
      return new Set(this.getLatestUpdate().toPlay);
    } else {
      return new Set();
    }
  }

  // Returns the number of players needed to play the game.
  // Can assume that the options have been sanatized.
  protected abstract numberOfPlayersForOptions(options: O): number;
  // Creates and returns a new, valid, object to be used as the games options.
  // Should throw an InvalidOptionsError if the options object is invalid.
  protected abstract sanitizeOptions(options: any): O;
  // Creates and returns a new, valid, object to be used a a player move.
  // Should throw an InvalidMoveError if the move object is invalid.
  protected abstract sanitizeMove(move: any): M;
  // Asserts that the specified move is currently legal for the specified player.
  // Should throw an IllegalMoveError if the move is not legal.
  // This method can assume that "move" is well formed (it will be the return value of a
  // sanitizeMove call).
  protected abstract assertMoveIsLegal(move: M, player: Player): void;
  // Set up the game with the provided random seed (i.e. determine who goes first or distribute the
  // first hand of cards).
  protected abstract initialize(seed: string): Update<PU, PR>;
  // Play out the given moves.
  // This method can assume that the moves are all valid and legal.
  protected abstract processTurn(moves: Map<Player, M>): Update<PU, PR>;
  // Return the list of players that won.
  // Will only be called at the end of a game.
  protected abstract getWinners(): Array<Player>;
}
