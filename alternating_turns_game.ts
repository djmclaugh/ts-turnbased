import { Game, Player, Update } from "./game";

// Abstract subclass of the Game class that implement functionality for games where there is only
// one player per turn (no simultanious turns).
export abstract class AlternatingTurnsGame extends Game {
  // Since there is exactly one move per turn, instead of defining how to process a map of moves,
  // the subclass can simply define how to process a single move.
  protected abstract processMove(move: any): Update;
  protected processTurn(moves: Map<Player, any>): Update {
    let move = moves.get(this.getPlayerToPlay());
    return this.processMove(move);
  }

  // Since there is exactly one player that can play per turn, instead of defining a set of players
  // that need to play, the subclass can simply define the player that needs to play.
  // Must return -1 if the game is over.
  public abstract getPlayerToPlay(): Player;
  public getPlayersToPlay(): Set<Player> {
    let player: Player = this.getPlayerToPlay();
    return player == -1 ? new Set() : new Set([player]);
  }
}
