import { Game, PublicUpdate } from "../game";
import { Tictactoe } from "./tictactoe";

import { assert } from "chai";

describe("Tictactoe", () => {
  // Sanity test. Makes sure that the expected use case works from start to end.
  it("should be able to play a full game", () => {
    let game: Game<null, number, number, null> = new Tictactoe();

    game.start();
    game.playMove(0, 0);
    game.playMove(1, 1);
    game.playMove(2, 0);
    game.playMove(3, 1);
    game.playMove(4, 0);
    game.playMove(5, 1);
    game.playMove(6, 0);

    let winners: Array<number> = game.getLatestUpdate().winners;
    assert.equal(winners.length, 1);
    assert.include(winners, 0);
    assert.equal(game.getPlayersToPlay().size, 0);
    let moves: Array<number> =
        game.getAllUpdates().map((update: PublicUpdate<number>) => update.publicInfo);
    assert.deepEqual(moves, [null, 0, 1, 2, 3, 4, 5, 6]);
  });

  it("should throw an error if some player plays out of turn", () => {
    let game: Game<null, number, number, null> = new Tictactoe();
    game.start();
    game.playMove(0, 0);
    game.playMove(1, 1);
    assert.throws(() => game.playMove(2, 1));
  });

  it("should throw an error if the move is invalid", () => {
    let game: Game<null, number, number, null> = new Tictactoe();
    game.start();
    assert.throws(() => game.playMove(-1, 0));
  });

  it("should throw an error if the move is illegal", () => {
    let game: Game<null, number, number, null> = new Tictactoe();
    game.start();
    game.playMove(0, 0)
    assert.throws(() => game.playMove(0, 1));
  });
});
