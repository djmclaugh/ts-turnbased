import { GenericGame } from "../game";
import { SimpleGame, SimpleMove, SimpleOptions, SimpleTurnEvents } from "./simple_game";

import { assert } from "chai";

describe("SimpleGame", () => {
  // Sanity test. Makes sure that the expected use case works from start to end.
  it("should be able to play a full game", () => {
    let options: SimpleOptions = {
      numPlayers: 3,
      numPoints: 5
    };
    let events: SimpleTurnEvents;
    let game: GenericGame = new SimpleGame(options, "test_seed");
    events = game.getLatestTurnEvents();
    assert.isNull(events.calls);
    assert.deepEqual(events.publicRolls, [6, 1, 4]);
    assert.deepEqual(events.privateRolls, [5, 2, 2]);
    assert.isNull(events.lastPrivateRolls);

    game.playMove({guess: "even"}, 0);
    events = game.getLatestTurnEvents();
    assert.deepEqual(events.calls, [{guess: "even"}, null, null]);
    assert.deepEqual(events.publicRolls, [4, 1, 1]);
    assert.deepEqual(events.privateRolls, [3, 3, 2]);
    assert.deepEqual(events.lastPrivateRolls, [5, 2, 2]);

    game.playMove({guess: "odd"}, 0);
    events = game.getLatestTurnEvents();
    assert.deepEqual(events.calls, [{guess: "odd"}, null, null]);
    assert.deepEqual(events.publicRolls, [6, 6, 1]);
    assert.deepEqual(events.privateRolls, [5, 5, 2]);
    assert.deepEqual(events.lastPrivateRolls, [3, 3, 2]);

    game.playMove({guess: "even"}, 0);
    game.playMove({guess: "even"}, 1);
    events = game.getLatestTurnEvents();
    assert.deepEqual(events.calls, [{guess: "even"}, {guess: "even"}, null]);
    assert.deepEqual(events.publicRolls, [4, 4, 1]);
    assert.deepEqual(events.privateRolls, [2, 3, 3]);
    assert.deepEqual(events.lastPrivateRolls, [5, 5, 2]);

    game.playMove({guess: "odd"}, 0);
    game.playMove({guess: "even"}, 1);
    events = game.getLatestTurnEvents();
    assert.deepEqual(events.calls, [{guess: "odd"}, {guess: "even"}, null]);
    assert.deepEqual(events.publicRolls, [1, 6, 6]);
    assert.deepEqual(events.privateRolls, [2, 5, 5]);
    assert.deepEqual(events.lastPrivateRolls, [2, 3, 3]);

    game.playMove({guess: "odd"}, 1);
    game.playMove({guess: "even"}, 2);
    events = game.getLatestTurnEvents();
    assert.deepEqual(events.calls, [null, {guess: "odd"}, {guess: "even"}]);
    assert.deepEqual(events.publicRolls, [1, 4, 4]);
    assert.deepEqual(events.privateRolls, [2, 2, 3]);
    assert.deepEqual(events.lastPrivateRolls, [2, 5, 5]);

    game.playMove({guess: "odd"}, 1);
    game.playMove({guess: "even"}, 2);
    events = game.getLatestTurnEvents();
    assert.deepEqual(events.calls, [null, {guess: "odd"}, {guess: "even"}]);
    assert.deepEqual(events.publicRolls, [1, 1, 6]);
    assert.deepEqual(events.privateRolls, [3, 2, 5]);
    assert.deepEqual(events.lastPrivateRolls, [2, 2, 3]);

    game.playMove({guess: "even"}, 2);
    events = game.getLatestTurnEvents();
    assert.deepEqual(events.calls, [null, null, {guess: "even"}]);
    assert.deepEqual(events.publicRolls, [6, 1, 4]);
    assert.deepEqual(events.privateRolls, [5, 2, 2]);
    assert.deepEqual(events.lastPrivateRolls, [3, 2, 5]);

    game.playMove({guess: "odd"}, 0);
    events = game.getLatestTurnEvents();
    assert.deepEqual(events.calls, [{guess: "odd"}, null, null]);
    assert.deepEqual(events.publicRolls, [4, 1, 1]);
    assert.deepEqual(events.privateRolls, [3, 3, 2]);
    assert.deepEqual(events.lastPrivateRolls, [5, 2, 2]);

    game.playMove({guess: "odd"}, 0);
    events = game.getLatestTurnEvents();
    assert.deepEqual(events.calls, [{guess: "odd"}, null, null]);
    assert.isNull(events.publicRolls);
    assert.isNull(events.privateRolls);
    assert.deepEqual(events.lastPrivateRolls, [3, 3, 2]);

    let winners: Set<number> = game.getWinners();
    assert.equal(winners.size, 1);
    assert.isTrue(winners.has(0));
  });

  it("should throw an error if the options are invalid", () => {
    let options: SimpleOptions = {
      numPlayers: -1,
      numPoints: 5
    };
    assert.throws(() => new SimpleGame(options, "test_seed"));
  });

  it("should throw an error if some player plays out of turn", () => {
    let options: SimpleOptions = {
      numPlayers: 3,
      numPoints: 5
    };
    let game: GenericGame = new SimpleGame(options, "test_seed");
    assert.throws(() => game.playMove({guess: "odd"}, 1));
  });

  it("should throw an error if the move is invalid", () => {
    let options: SimpleOptions = {
      numPlayers: 3,
      numPoints: 5
    };
    let game: GenericGame = new SimpleGame(options, "test_seed");
    // Make sure that it's actually player 0's turn to play.
    assert.isTrue(game.getPlayersToPlay().has(0));
    assert.throws(() => game.playMove({guess: "not even nor odd"}, 0));
  });

  it("should throw an error if the move is illegal", () => {
    let options: SimpleOptions = {
      numPlayers: 3,
      numPoints: 5
    };
    let game: GenericGame = new SimpleGame(options, "test_seed");
    // Make sure that it's actually player 0's turn to play.
    assert.isTrue(game.getPlayersToPlay().has(0));
    assert.throws(() => game.playMove({guess: "odd", gamble: true}, 0));

    // Check that it doesn't throw an error if the private roll is the same as the public.
    // The empty seed makes all rolls 1s.
    game = new SimpleGame(options, "");
    // Make sure that it's actually player 0's turn to play.
    assert.isTrue(game.getPlayersToPlay().has(0));
    assert.doesNotThrow(() => game.playMove({guess: "odd", gamble: true}, 0));
  });
});
