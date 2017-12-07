import { Game, Update } from "../game";
import { SimpleGame, SimpleMove, SimpleOptions, SimplePublicUpdate, SimplePrivateUpdate } from "./simple_game";

import { assert } from "chai";

describe("SimpleGame", () => {
  // Sanity test. Makes sure that the expected use case works from start to end.
  it("should be able to play a full game", () => {
    let options: SimpleOptions = {
      numPlayers: 3,
      numPoints: 5
    };
    let events: Update<SimplePublicUpdate, SimplePrivateUpdate>;
    let game: Game<SimpleOptions, SimpleMove, SimplePublicUpdate, SimplePrivateUpdate> =
        new SimpleGame(options);
    game.start("test_seed");
    events = game.getLatestUpdate();
    assert.isNull(events.publicInfo.calls);
    assert.deepEqual(events.publicInfo.publicRolls, [6, 1, 4]);
    assert.isNull(events.publicInfo.lastPrivateRolls);
    assert.deepEqual(events.privateInfo.map(object => object.privateRoll), [5, 2, 2]);

    game.playMove({guess: "even"}, 0);
    events = game.getLatestUpdate();
    assert.deepEqual(events.publicInfo.calls, [{guess: "even"}, null, null]);
    assert.deepEqual(events.publicInfo.publicRolls, [4, 1, 1]);
    assert.deepEqual(events.publicInfo.lastPrivateRolls, [5, 2, 2]);
    assert.deepEqual(events.privateInfo.map(object => object.privateRoll), [3, 3, 2]);

    game.playMove({guess: "odd"}, 0);
    events = game.getLatestUpdate();
    assert.deepEqual(events.publicInfo.calls, [{guess: "odd"}, null, null]);
    assert.deepEqual(events.publicInfo.publicRolls, [6, 6, 1]);
    assert.deepEqual(events.publicInfo.lastPrivateRolls, [3, 3, 2]);
    assert.deepEqual(events.privateInfo.map(object => object.privateRoll), [5, 5, 2]);

    game.playMove({guess: "even"}, 0);
    game.playMove({guess: "even"}, 1);
    events = game.getLatestUpdate();
    assert.deepEqual(events.publicInfo.calls, [{guess: "even"}, {guess: "even"}, null]);
    assert.deepEqual(events.publicInfo.publicRolls, [4, 4, 1]);
    assert.deepEqual(events.publicInfo.lastPrivateRolls, [5, 5, 2]);
    assert.deepEqual(events.privateInfo.map(object => object.privateRoll), [2, 3, 3]);

    game.playMove({guess: "odd"}, 0);
    game.playMove({guess: "even"}, 1);
    events = game.getLatestUpdate();
    assert.deepEqual(events.publicInfo.calls, [{guess: "odd"}, {guess: "even"}, null]);
    assert.deepEqual(events.publicInfo.publicRolls, [1, 6, 6]);
    assert.deepEqual(events.publicInfo.lastPrivateRolls, [2, 3, 3]);
    assert.deepEqual(events.privateInfo.map(object => object.privateRoll), [2, 5, 5]);

    game.playMove({guess: "odd"}, 1);
    game.playMove({guess: "even"}, 2);
    events = game.getLatestUpdate();
    assert.deepEqual(events.publicInfo.calls, [null, {guess: "odd"}, {guess: "even"}]);
    assert.deepEqual(events.publicInfo.publicRolls, [1, 4, 4]);
    assert.deepEqual(events.publicInfo.lastPrivateRolls, [2, 5, 5]);
    assert.deepEqual(events.privateInfo.map(object => object.privateRoll), [2, 2, 3]);

    game.playMove({guess: "odd"}, 1);
    game.playMove({guess: "even"}, 2);
    events = game.getLatestUpdate();
    assert.deepEqual(events.publicInfo.calls, [null, {guess: "odd"}, {guess: "even"}]);
    assert.deepEqual(events.publicInfo.publicRolls, [1, 1, 6]);
    assert.deepEqual(events.publicInfo.lastPrivateRolls, [2, 2, 3]);
    assert.deepEqual(events.privateInfo.map(object => object.privateRoll), [3, 2, 5]);

    game.playMove({guess: "even"}, 2);
    events = game.getLatestUpdate();
    assert.deepEqual(events.publicInfo.calls, [null, null, {guess: "even"}]);
    assert.deepEqual(events.publicInfo.publicRolls, [6, 1, 4]);
    assert.deepEqual(events.publicInfo.lastPrivateRolls, [3, 2, 5]);
    assert.deepEqual(events.privateInfo.map(object => object.privateRoll), [5, 2, 2]);

    game.playMove({guess: "odd"}, 0);
    events = game.getLatestUpdate();
    assert.deepEqual(events.publicInfo.calls, [{guess: "odd"}, null, null]);
    assert.deepEqual(events.publicInfo.publicRolls, [4, 1, 1]);
    assert.deepEqual(events.publicInfo.lastPrivateRolls, [5, 2, 2]);
    assert.deepEqual(events.privateInfo.map(object => object.privateRoll), [3, 3, 2]);

    game.playMove({guess: "odd"}, 0);
    events = game.getLatestUpdate();
    assert.deepEqual(events.publicInfo.calls, [{guess: "odd"}, null, null]);
    assert.isNull(events.publicInfo.publicRolls);
    assert.deepEqual(events.publicInfo.lastPrivateRolls, [3, 3, 2]);
    assert.isNull(events.privateInfo);

    let winners: Array<number> = game.getLatestUpdate().winners;
    assert.equal(winners.length, 1);
    assert.include(winners, 0);
  });

  it("should throw an error if the options are invalid", () => {
    let options: SimpleOptions = {
      numPlayers: -1,
      numPoints: 5
    };
    assert.throws(() => new SimpleGame(options));
  });

  it("should throw an error if some player plays out of turn", () => {
    let options: SimpleOptions = {
      numPlayers: 3,
      numPoints: 5
    };
    let game: Game<SimpleOptions, SimpleMove, SimplePublicUpdate, SimplePrivateUpdate> =
        new SimpleGame(options);
    game.start("test_seed");
    assert.throws(() => game.playMove({guess: "odd"}, 1));
  });

  it("should throw an error if the move is invalid", () => {
    let options: SimpleOptions = {
      numPlayers: 3,
      numPoints: 5
    };
    let game: Game<SimpleOptions, any, SimplePublicUpdate, SimplePrivateUpdate> =
        new SimpleGame(options);
    game.start("test_seed");
    // Make sure that it's actually player 0's turn to play.
    assert.isTrue(game.getPlayersToPlay().has(0));
    assert.throws(() => game.playMove({guess: "not even nor odd"}, 0));
  });

  it("should throw an error if the move is illegal", () => {
    let options: SimpleOptions = {
      numPlayers: 3,
      numPoints: 5
    };
    let game: Game<SimpleOptions, SimpleMove, SimplePublicUpdate, SimplePrivateUpdate> =
        new SimpleGame(options);
    game.start("test_seed");
    // Make sure that it's actually player 0's turn to play.
    assert.isTrue(game.getPlayersToPlay().has(0));
    assert.throws(() => game.playMove({guess: "odd", gamble: true}, 0));

    // Check that it doesn't throw an error if the private roll is the same as the public.
    // The empty seed happens to make all rolls 1s.
    game = new SimpleGame(options);
    game.start("");
    // Make sure that it's actually player 0's turn to play.
    assert.isTrue(game.getPlayersToPlay().has(0));
    assert.doesNotThrow(() => game.playMove({guess: "odd", gamble: true}, 0));
  });
});
