import { Game, Player, Update } from "../game";
import { AlternatingTurnsGame } from "../alternating_turns_game";
import { IllegalMoveError, InvalidMoveError, InvalidOptionsError } from "../errors";

// Implementation of a simple alternating turns game to test the AlternatingTurnsGame abstract class
// Here are the rules of the game (where the number of players is a configurable parameter):
// - At the begining, each player is dealt 5 cards from 1 to 5.
// - The first player can play any card.
// - The next player must play a card that is exactly 1 higher or exactly 1 lower than the card
//   played the turn before.
// - This goes on until a player has no legal moves (in which case, that player loses).

export interface SimpleOptions {
  numPlayers: number; // The number of players. Any number greater or equal to 1.
};

export class SimpleAlternatingTurnsGame extends AlternatingTurnsGame {
  protected options: SimpleOptions;
  private cardsInHand: Array<Set<number>>;
  private lastCard: number;
  private lastPlayer: number;

  constructor(options: any) {
    super(options);
  }

  protected initialize(seed: string): Update {
    this.lastCard = -1;
    this.lastPlayer = -1;
    this.cardsInHand = [];
    for (let i: number = 0; i < this.options.numPlayers; ++i) {
      this.cardsInHand.push(new Set([1, 2, 3, 4,5]));
    }
    return {
      publicInfo: null
    }
  }

  // numPlayers must be a number greater or equal to 1.
  // numPlayers will be floored.
  // numPoints must be a number greater or equal to 1.
  // If numPoints is null or invalid, it will default to 10 instead of throwing an error.
  protected sanitizeOptions(options: any): SimpleOptions {
    if (typeof options.numPlayers != "number") {
      throw new InvalidOptionsError(options, "options must specify the number of players");
    } else if (options.numPlayers < 1) {
      throw new InvalidOptionsError(options, "number of players must be at least 1");
    }
    return {
      numPlayers: Math.floor(options.numPlayers)
    };
  }

  // A move must be a number between 1 and 5 inclusively.
  protected sanitizeMove(move: any): number {
    if (typeof move.card != "number" || move.card < 1 || move.card > 5) {
      throw new InvalidMoveError(move, "move must be a number between 1 and 5");
    }
    return Math.floor(move.card);
  }

  protected assertMoveIsLegal(move: number, player: Player): void {
    if (this.lastCard != -1 && Math.abs(this.lastCard - move) != 1) {
      let reason: string = "Card " + move + " is not exactly 1 aways from " + this.lastCard;
      throw new IllegalMoveError(move, player, reason);
    }
    if (!this.cardsInHand[player].has(move)) {
      let reason: string = "Card " + move + " has already been played";
      throw new IllegalMoveError(move, player, reason);
    }
  }

  protected processMove(move): Update {
    let currentPlayer: Player = this.nextPlayer();
    this.cardsInHand[currentPlayer].delete(move);
    this.lastCard = move;
    this.lastPlayer = currentPlayer;
    return {publicInfo: move};
  }

  private nextPlayer(): Player {
    return (this.lastPlayer + 1) % this.options.numPlayers;
  }

  private hasLegalMoves(player: Player): boolean {
    let cards: Set<number> = this.cardsInHand[player];
    return this.lastCard == -1 || cards.has(this.lastCard - 1) || cards.has(this.lastCard + 1);
  }

  getPlayerToPlay(): Player {
    let nextPlayer: Player = this.nextPlayer();
    return this.hasLegalMoves(nextPlayer) ? nextPlayer : -1;
  }

  getWinners(): Set<Player> {
    let winners: Set<Player> = new Set();
    let nextPlayer: Player = this.nextPlayer();
    if (!this.hasLegalMoves(nextPlayer)) {
      for (let i = 0; i < this.options.numPlayers; ++i) {
        if (i != nextPlayer) {
          winners.add(i);
        }
      }
    }
    return winners;
  }
}
