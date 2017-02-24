import { GenericGame } from "../game";
import { Tictactoe } from "./tictactoe";

import "chai";
import "mocha";

describe("Tictactoe", () => {
  // Sanity test. Makes sure that the expected use case works from start to end.
  it("should be able to play a full game", () => {
    let game: GenericGame = new Tictactoe();

    game.playMove(0, 0);
    game.playMove(1, 1);
    game.playMove(2, 0);
    game.playMove(3, 1);
    game.playMove(4, 0);
    game.playMove(5, 1);
    game.playMove(6, 0);
    console.log(game.getWinners());
  });

  // TOOD: write tests
});
