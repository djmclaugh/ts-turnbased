import { Game, Player, Update } from "../game";
import { IllegalMoveError, InvalidMoveError, InvalidOptionsError } from "../errors";

// Implementation of a simple game that uses all of the features that the Game abstract class
// supports (randomness, simultanious turns, hidden information, arbitrary number of players, and
// options). This allows us to test the Game abstract class.
// Here are the rules of the game (where the number of players and numPoints are configurable
// parameters):
// - Each round, every player roll two dice, one publicly and one privately.
// - Each player that rolled a maximal dice then simultanuously try to guess the parity of the sum
//   of the hidden dice of the high rollers.
// - If the private roll matches the public roll, the player can call a "gamble" for the cost of one
//   point.
// - Each player that guesses correctly wins a point (or 4 points if the player made a "gamble"
//   call).
// - First players to numPoints win the game (there can be multiple winners).

export interface SimpleOptions {
  numPlayers: number; // The number of players. Any number greater or equal to 1.
  numPoints?: number; // The number of points to reach. Defaults to 10.
};

export interface SimpleMove {
  guess: "even"|"odd";
  gamble?: boolean; // Defaults to false
};

export interface SimplePublicUpdate {
  // calls[i] contain the i-th player's move.
  // calls[i] will be null if the i-th player didn't play that turn.
  // calls will be null before the first turn.
  calls: Array<SimpleMove>;
  // publicRolls[i] contains what the i-th player rolled publicly.
  // publicRolls will be null if no dice were rolled (i.e. when a player wins).
  publicRolls: Array<number>;
  // lastPrivateRolls[i] contains what the i-th player rolled privately the turn before.
  // Might be different than privateRolls from the turn before since now those public rolls are all
  // public.
  // lastPrivateRolls will be null if this is the first turn.
  lastPrivateRolls: Array<number>;
}

export interface SimplePrivateUpdate {
  privateRoll: number;
}

export class SimpleGame extends Game<SimpleOptions, SimpleMove, SimplePublicUpdate, SimplePrivateUpdate> {
  // Number used to generate the next dice roll.
  private rollGenerator: number;
  // Players that have rolled the highest this turn.
  private highRollers: Array<Player>;
  // The parity of the sum of the private rolls of the highRollers.
  private highRollsParity: "odd"|"even";
  // The number points each player has.
  private points: Array<number>;
  // The latest public rolls.
  private publicRolls: Array<number>;
  // The latest private rolls.
  private privateRolls: Array<number>;
  // The private rolls from last turn.
  private lastPrivateRolls: Array<number>;

  constructor(options: SimpleOptions) {
    super(options);

    // Initialize private variables.
    this.privateRolls = [];
    this.publicRolls = [];
    this.points = [];
    this.lastPrivateRolls = null;
    this.highRollers = [];
    for (let i: number = 0; i < this.options.numPlayers; ++i) {
      this.points.push(0);
    }
  }

  protected initialize(seed: string): Update<SimplePublicUpdate, SimplePrivateUpdate> {
    // Setup the rollGenerator based on the provided seed.
    this.rollGenerator = 0
    for (let i = 0; i < seed.length; ++i) {
      let char: number = seed.charCodeAt(i);
      this.rollGenerator += char;
    }
    this.rollGenerator = this.rollGenerator % 127;

    // Roll first set of dice and create first update.
    this.rollAllDice();
    return this.currentUpdate(null);
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
      numPlayers: Math.floor(options.numPlayers),
      numPoints: typeof options.numPoints == "number" && options.numPoints >= 1
          ? options.numPoints
          : 10
    };
  }

  protected numberOfPlayersForOptions(options: SimpleOptions) {
    return options.numPlayers;
  }

  // A move must contain an even/odd guess.
  // gamble will be mapped to its "truthy" value.
  protected sanitizeMove(move: any): SimpleMove {
    if (move.guess != "even" && move.guess != "odd") {
      throw new InvalidMoveError(move, "move does not contain an even/odd guess");
    }
    let actualMove: SimpleMove = { guess: move.guess };
    if (move.gamble) {
      actualMove.gamble = true;
    }
    return actualMove;
  }

  // If the move is well formed and the player is not playing out of turn, the only reason a move
  // could be illegal is if they are trying to gamle when their private and public roll don't match.
  protected assertMoveIsLegal(move: SimpleMove, player: Player): void {
    if (this.publicRolls[player] != this.privateRolls[player] && move.gamble) {
      let reason: string = "Can only call a gamble if the public roll matches the private roll";
      throw new IllegalMoveError(move, player, reason);
    }
  }

  protected processTurn(moves: Map<Player, SimpleMove>): Update<SimplePublicUpdate, SimplePrivateUpdate> {
    // Remove 1 point from every player that gambled.
    // Assign 1 point to every player that made a correct guess (or 4 if they gambled).
    moves.forEach((move: SimpleMove, player: Player) => {
      if (move.gamble) {
        this.points[player] -= 1;
      }
      if (move.guess == this.highRollsParity) {
        this.points[player] += move.gamble ? 4 : 1;
      }
    });

    this.lastPrivateRolls = this.privateRolls.slice();
    if (this.getWinners().length == 0) {
      // If no one won yet, roll another set of dice.
      this.rollAllDice();
    } else {
      // Otherwise, set the dice rolls to null to indicate that they have not been rolled.
      this.publicRolls = null;
      this.privateRolls = null;
      this.highRollers = [];
    }

    // Transform the map of moves into an array of moves.
    let calls: Array<SimpleMove> = [];
    for (let i = 0; i < this.options.numPlayers; ++i) {
      let call: SimpleMove = moves.get(i);
      calls.push(call ? call : null);
    }

    return this.currentUpdate(calls);
  }

  protected getWinners(): Array<Player> {
    let winners: Array<Player> = [];
    this.points.forEach((value: number, index: number) => {
      if (value >= this.options.numPoints) {
        winners.push(index);
      }
    });
    return winners;
  }

  private currentUpdate(calls: Array<SimpleMove>): Update<SimplePublicUpdate, SimplePrivateUpdate> {
    let wrapper: (number) => SimplePrivateUpdate = (roll: number) => {
      return {privateRoll: roll};
    };
    let privateInfo: Array<SimplePrivateUpdate> =
        this.privateRolls ? this.privateRolls.map(wrapper) : null;
    return {
      publicInfo: {
        calls: calls,
        publicRolls: this.publicRolls,
        lastPrivateRolls: this.lastPrivateRolls,
      },
      toPlay: this.highRollers,
      privateInfo: privateInfo
    };
  }

  private rollAllDice(): void {
    let highestRoll: number = 0;
    this.highRollers = [];
    for (let i: number = 0; i < this.options.numPlayers; ++i) {
      this.privateRolls[i] = this.getNextDiceRoll();
      this.publicRolls[i] = this.getNextDiceRoll();
      if (this.publicRolls[i] > highestRoll) {
        highestRoll = this.publicRolls[i];
        this.highRollers = [];
      }
      if (this.publicRolls[i] == highestRoll) {
        this.highRollers.push(i);
      }
    }
    // Figure out the parity of the highroller's private rolls.
    let highRollersPrivateSum = 0;
    this.highRollers.forEach(player => highRollersPrivateSum += this.privateRolls[player]);
    this.highRollsParity = highRollersPrivateSum % 2 == 0 ? "even" : "odd";
  }

  // Very simple (and predictable) pseudo random number generator.
  // Do not use outside of tests.
  private getNextDiceRoll(): number{
    this.rollGenerator = (this.rollGenerator * 8191) % 127;
    return 1 + (this.rollGenerator % 6);
  }
}
