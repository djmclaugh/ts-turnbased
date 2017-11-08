import { Game, Update } from "../game";
import { SimpleAlternatingTurnsGame } from "./simple_alternating_turns_game";

import { assert } from "chai";

describe("SimpleAlternatingTurnsGame", () => {
  // Sanity test. Makes sure that the expected use case works from start to end.
  it("should be able to play a full game", () => {
    let events: Update;
    let game: Game = new SimpleAlternatingTurnsGame({numPlayers: 4});
    game.start();
    events = game.getLatestUpdate();

    game.playMove({card: 2}, 0);
    events = game.getLatestUpdate();
    assert.equal(events.publicInfo, 2);

    game.playMove({card: 1}, 1);
    events = game.getLatestUpdate();
    assert.equal(events.publicInfo, 1);

    game.playMove({card: 2}, 2);
    events = game.getLatestUpdate();
    assert.equal(events.publicInfo, 2);

    game.playMove({card: 1}, 3);
    events = game.getLatestUpdate();
    assert.equal(events.publicInfo, 1);

    let winners: Set<number> = game.getWinners();
    assert.equal(winners.size, 3);
    assert.isTrue(winners.has(1));
    assert.isTrue(winners.has(2));
    assert.isTrue(winners.has(3));
  });
});
