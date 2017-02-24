import { GenericGame } from "../game";
import { SimpleGame, SimpleMove, SimpleOptions, SimpleTurnEvents } from "./simple_game";

import "chai";
import "mocha";

describe("SimpleGame", () => {
  // Sanity test. Makes sure that the expected use case works from start to end.
  it("should be able to play a full game", () => {
    let options: SimpleOptions = {
      numPlayers: 3,
      numPoints: 5
    };
    let game: GenericGame = new SimpleGame(options, "test_seed");
    console.log(game.getLatestTurnEvents());
  });

  // TOOD: write tests
});
