import { Game, Player, Update } from "./game";

// Possible status of an abstract strategy game.
export enum Status {
  IN_PROGRESS,
  DRAW,
  P1_WIN,
  P2_WIN
}

// Abstract subclass of the Game class that implement functionality common to all abstrac strategy
// games (from now on refered to as ASGs), simplifying even further the implementation of such
// games.
// https://en.wikipedia.org/wiki/Abstract_strategy_game
export abstract class AbstractStrategyGame extends Game {
  // Moves are everything in ASGs. They fully determine the game state.
  // Keep track of all moves played to be able to implement the "getTurnEvents" methods.
  protected moves: Array<any> = [];

  // The following 3 methods still need to be implemented by subclasses:
  // protected abstract sanitizeOptions(options: any): any;
  // protected abstract sanitizeMove(move: any): any;
  // protected abstract assertMoveIsLegal(move: any, player: Player): void;

  // ASGs have perfect information and are deterministic. The starting position will always be the
  // same and can be inferred by the options. 
  protected initialize(seed: string): Update {
    return null;
  }

  // Since ASGs are always alternating turns, we can partially implment processTurn and let the
  // subclass specify how to handle an individual move instead of a map of moves.
  protected abstract processMove(move: any): void;

  protected processTurn(moves: Map<Player, any>): Update {
    let move = moves.get(this.moves.length % 2);
    this.processMove(move);
    this.moves.push(move);
    return {publicInfo: move};
  }

  // ASGs have only 3 possible final outcomes: player 1 wins, player 2 wins, or a draw.
  // In any other case, the game is still in progress.
  // We can therefore partially implement getPlayersToPlay and getWinners and let the sublcass
  // determine in which of the 4 states the game is currently in.
  protected abstract getStatus(): Status;

  getPlayersToPlay(): Set<Player> {
    if (this.getStatus() == Status.IN_PROGRESS) {
      return new Set<Player>([this.moves.length % 2]);
    }
    return new Set<Player>();
  }

  getWinners(): Set<Player> {
    let winners: Set<Player> = new Set<Player>();
    let status: Status = this.getStatus();
    if (status == Status.P1_WIN) {
      winners.add(0);
    } else if (status == Status.P2_WIN) {
      winners.add(1);
    }
    return winners;
  }
}
