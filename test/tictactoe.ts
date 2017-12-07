import { AbstractStrategyGame, Status } from "../abstract_strategy_game"
import { InvalidMoveError, IllegalMoveError } from "../errors"

// Simple abtract strategy game to be able to test the AbstracStrategyGame abstract class.
// https://en.wikipedia.org/wiki/Tic-tac-toe
//
// No variants are supported so no options are needed.
// Each move is a number from 0 to 8 indicating which cell the player is taking:
// 0 | 1 | 2
// ---------
// 3 | 4 | 5
// ---------
// 6 | 7 | 8
export class Tictactoe extends AbstractStrategyGame<null, number> {
  // Board patterns are stored as 9-bit numbers where the i-th bit indicates if the i-th cell is
  // taken or not.

  // Pattern for the currently place Xs.
  private xBoard: number = 0;
  // Pattern for the currently placed Os.
  private yBoard: number = 0;

  // List of patterns for the possible "3-in-a-row"s
  private static readonly wins: Array<number> = [
     1 +   2 +   4,  // 000 000 111
     8 +  16 +  32,  // 000 111 000
    64 + 128 + 256,  // 111 000 000
     1 +   8 +  64,  // 001 001 001
     2 +  16 + 128,  // 010 010 010
     4 +  32 + 256,  // 100 100 100
     1 +  16 + 256,  // 100 010 001
     4 +  16 +  64,  // 001 010 100
  ];

  // Override constructor to no longer take in options.
  constructor() {
    super(null);
  }

  // No options needed, always return null.
  protected sanitizeOptions(options: any): null {
    return null;
  }

  // Moves must be numbers from 0 to 8.
  // Numbers that are not whole numbers will be accepted anyway for simplicity's sake (but they will
  // be floored).
  protected sanitizeMove(move: any): number {
    if (typeof move != "number" || move < 0 || move >= 9) {
      throw new InvalidMoveError(move, "Move must be a number from 0 to 8");
    }
    return Math.floor(move);
  }

  // A move is legal if and only if the specified cell is not already occupied.
  protected assertMoveIsLegal(move: number, player: number): void {
    let boardWithMove: number = Math.pow(2, move);
    if (this.xBoard & boardWithMove || this.yBoard & boardWithMove) {
      throw new IllegalMoveError(move, player, "Position is already occupied");
    }
  }

  // Add the appropriate bit to the appropriate pattern.
  protected processMove(move: number): void {
    let boardWithMove: number = Math.pow(2, move);
    if (this.moves.length % 2 == 0) {
      this.xBoard |= boardWithMove;
    } else {
      this.yBoard |= boardWithMove;
    }
  }

  // A player wins if their board contains one of the win patterns.
  protected getStatus(): Status {
    for (let win of Tictactoe.wins) {
      if ((win & this.xBoard) == win) {
        return Status.P1_WIN;
      } else if ((win & this.yBoard) == win) {
        return Status.P2_WIN;
      }
    }
    if (this.moves.length == 9) {
      return Status.DRAW;
    }
    return Status.IN_PROGRESS;
  }
}
