import { GenericGame } from "../game";
import { Tictactoe } from "./tictactoe";

import { assert } from "chai";

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

    let winners: Set<number> = game.getWinners();
    assert.equal(winners.size, 1);
    assert.isTrue(winners.has(0));
    assert.equal(game.getPlayersToPlay().size, 0);
    assert.deepEqual(game.getTurnEvents(), [null, 0, 1, 2, 3, 4, 5, 6]);
    assert.deepEqual(game.getTurnEventsAsSeenBy(-1), [null, 0, 1, 2, 3, 4, 5, 6]);
    assert.deepEqual(game.getTurnEventsAsSeenBy(0), [null, 0, 1, 2, 3, 4, 5, 6]);
  });

  it("should throw an error if some player plays out of turn", () => {
    let game: GenericGame = new Tictactoe();
    game.playMove(0, 0);
    game.playMove(1, 1);
    assert.throws(() => game.playMove(2, 1));
  });

  it("should throw an error if the move is invalid", () => {
    let game: GenericGame = new Tictactoe();
    assert.throws(() => game.playMove(-1, 0));
  });

  it("should throw an error if the move is illegal", () => {
    let game: GenericGame = new Tictactoe();
    game.playMove(0, 0)
    assert.throws(() => game.playMove(0, 1));
  });
});
