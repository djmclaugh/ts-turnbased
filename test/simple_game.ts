import { Game, Player } from "../game";
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

export interface SimpleTurnEvents {
  // calls[i] contain the i-th player's move.
  // calls[i] will be null if the i-th player didn't play that turn.
  // calls will be null before the first turn.
  calls: Array<SimpleMove>;
  // publicRolls[i] contains what the i-th player rolled publicly.
  // publicRolls will be null if no dice were rolled (i.e. when a player wins).
  publicRolls: Array<number>;
  // privateRolls[i] contains what the i-th player rolled privately.
  // privateRolls[i] will be -1 if that roll is unkown.
  // privateRolls will be null if no dice were rolled (i.e. when a player wins)
  privateRolls: Array<number>;
  // lastPrivateRolls[i] contains what the i-th player rolled privately the turn before.
  // Might be different than privateRolls from the turn before since now those public rolls are all
  // public.
  // lastPrivateRolls will be null if this is the first turn.
  lastPrivateRolls: Array<number>;
};

function nullOrSlice(array: Array<any>):Array<any> {
  return array ? array.slice() : null;
}

function copyEvents(events: SimpleTurnEvents): SimpleTurnEvents {
  return {
    calls: nullOrSlice(events.calls),
    publicRolls: nullOrSlice(events.publicRolls),
    privateRolls: nullOrSlice(events.privateRolls),
    lastPrivateRolls: nullOrSlice(events.lastPrivateRolls)
  };
}

export class SimpleGame extends Game<SimpleOptions, SimpleMove, SimpleTurnEvents> {
  // History of all events.
  private turnEvents: Array<SimpleTurnEvents>;
  // Number used to generate the next dice roll.
  private rollGenerator: number;
  // Players that have rolled the highest this turn.
  private highRollers: Set<Player>;
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

  constructor(options: any, seed: string) {
    super(options, seed);
    
    // Setup the rollGenerator based on the provided seed.
    this.rollGenerator = 0
    for (let i = 0; i < this.seed.length; ++i) {
      let char: number = this.seed.charCodeAt(i);
      this.rollGenerator += char;
    }
    this.rollGenerator = Math.floor(this.rollGenerator) % 127;

    // Initialize private variables.
    this.turnEvents = [];
    this.privateRolls = [];
    this.publicRolls = [];
    this.points = [];
    this.lastPrivateRolls = null;
    this.highRollers = new Set<Player>();
    for (let i: number = 0; i < this.options.numPlayers; ++i) {
      this.points.push(0);
    }

    // Roll first set of dice and create first events.
    this.rollAllDice();
    this.turnEvents.push({
      calls: null,
      publicRolls: this.publicRolls,
      privateRolls: this.privateRolls,
      lastPrivateRolls: this.lastPrivateRolls
    });
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

  // A move must contain an even/odd guess.
  // gamble will be mapped to its "truthy" value.
  protected sanitizeMove(move: any): SimpleMove {
    if (move.guess != "even" && move.guess != "odd") {
      throw new InvalidMoveError(move, "move does not contain an even/odd guess");
    }
    return {
      guess: move.guess,
      gamble: move.gamble == true
    };
  }

  // If the move is well formed and the player is not playing out of turn, the only reason a move
  // could be illegal is if they are trying to gamle when their private and public roll don't match.
  protected assertMoveIsLegal(move: SimpleMove, player: Player): void {
    if (this.publicRolls[player] != this.privateRolls[player] && move.gamble) {
      let reason: string = "Can only call a gamble if the public roll matches the private roll";
      throw new IllegalMoveError(move, player, reason);
    }
  }

  protected processTurn(moves: Map<Player, SimpleMove>): void {
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
    if (this.getWinners().size == 0) {
      // If no one won yet, roll another set of dice.
      this.rollAllDice();
    } else {
      // Otherwise, set the dice rolls to null to indicate that they have not been rolled.
      this.publicRolls = null;
      this.privateRolls = null;
      this.highRollers.clear();
    }

    // Transform the map of moves into an array of moves.
    let calls: Array<SimpleMove> = [];
    for (let i = 0; i < this.options.numPlayers; ++i) {
      let call: SimpleMove = moves.get(i);
      calls.push(call ? call : null);
    }

    // Add the events for this turn.
    this.turnEvents.push({
      calls: calls,
      publicRolls: this.publicRolls,
      privateRolls: this.privateRolls,
      lastPrivateRolls: this.lastPrivateRolls
    });
  }
  
  // Only the high rollers can play.
  getPlayersToPlay(): Set<Player> {
    return new Set<Player>(this.highRollers);
  }

  getWinners(): Set<Player> {
    let winners: Set<Player> = new Set<Player>();
    this.points.forEach((value: number, index: number) => {
      if (value >= this.options.numPoints) {
        winners.add(index);
      }
    })
    return winners;
  }

  getTurnEvents(): Array<SimpleTurnEvents> {
    return this.turnEvents.map(events => copyEvents(events));
  }

  getTurnEventsAsSeenBy(player: Player): Array<SimpleTurnEvents> {
    return this.turnEvents.map(events => {
        let copy: SimpleTurnEvents = copyEvents(events);
        copy.privateRolls = this.privateRollsAsSeenByPlayer(copy.privateRolls, player);
        return copy;
    });
  }

  getLatestTurnEvents(): SimpleTurnEvents {
    return copyEvents(this.turnEvents[this.turnEvents.length - 1]);
  }

  getLatestTurnEventsAsSeenBy(player: Player): SimpleTurnEvents {
    let copy: SimpleTurnEvents = copyEvents(this.turnEvents[this.turnEvents.length - 1]);
    copy.privateRolls = this.privateRollsAsSeenByPlayer(copy.privateRolls, player);
    return copy;
  }

  // Utility method to hide rolls the specified player is not allowed to see.
  // Correctly handles -1 and other "invalid" players as a spectator that can't see any private
  // roll.
  private privateRollsAsSeenByPlayer(rolls: Array<number>, player: Player) {
    return rolls.map((roll: number, index: number) => index == player ? roll : -1);
  }

  private rollAllDice(): void {
    let highestRoll: number = 0;
    this.highRollers.clear();
    for (let i: number = 0; i < this.options.numPlayers; ++i) {
      this.privateRolls[i] = this.getNextDiceRoll();
      this.publicRolls[i] = this.getNextDiceRoll();
      if (this.publicRolls[i] > highestRoll) {
        highestRoll = this.publicRolls[i];
        this.highRollers.clear();
      }
      if (this.publicRolls[i] == highestRoll) {
        this.highRollers.add(i);
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
    return this.rollGenerator % 6;
  }
}