import { Game, Player } from "./game";

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
export abstract class AbstractStrategyGame<O, M> extends Game<O, M, M> {
  // Moves are everything in ASGs. They fully determine the game state.
  // Keep track of all moves played to be able to implement the "getTurnEvents" methods.
  protected moves: Array<M> = [];

  // The following 3 methods still need to be implemented by the subclass.
  // protected abstract sanitizeOptions(options: any): O;
  // protected abstract sanitizeMove(move: any): M;
  // protected abstract assertMoveIsLegal(move: M, player: Player): void;

  // Since ASGs are always alternating turns, we can partially implment processTurn and let the
  // subclass specify how to handle an indidual move instead of a map of moves.
  protected abstract processMove(move: M): void;

  protected processTurn(moves: Map<Player, M>): void {
    let move: M = moves.get(this.moves.length % 2);
    this.processMove(move);
    this.moves.push(move);
  }

  // ASGs have only 3 possible final outcomes: player 1 wins, player 2 wins, or a draw.
  // In any other case, the game is still in progress.
  // Using those facts, we can partially implement getPlayersToPlay and getWinners and let
  // the sublcass determine in which of the 4 states the game is currently in.
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

  // ASGs are deterministic, perfect information games. So the moves by themselves fully specifies
  // the state of the game and every player can see all moves. So the events for a particular turn,
  // as seen by any player, is exactly the move that happened that turn.
  getTurnEvents(): Array<M> {
    return [null].concat(this.moves);
  }

  getTurnEventsAsSeenBy(player: Player): Array<M> {
    return this.getTurnEvents();
  }

  getLatestTurnEvents(): M {
    let moveNumber = this.moves.length - 1;
    if (moveNumber >= 0) {
      return this.moves[moveNumber];
    }
    return null;
  }

  getLatestTurnEventsAsSeenBy(player:Player): M {
    return this.getLatestTurnEvents();
  }
}
