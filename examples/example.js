// This is an example of how to use this package as an npm package without typescript.

var Game = require("../game").Game;

var winGrid = {};
winGrid["rock"] = {};
winGrid["paper"] = {};
winGrid["scissors"] = {};

winGrid["rock"]["rock"] = 0;
winGrid["rock"]["paper"] = 0;
winGrid["rock"]["scissors"] = 1;

winGrid["paper"]["rock"] = 1;
winGrid["paper"]["paper"] = 0;
winGrid["paper"]["scissors"] = 0;

winGrid["scissors"]["rock"] = 0;
winGrid["scissors"]["paper"] = 1;
winGrid["scissors"]["scissors"] = 0;

// There are many ways to "extend" "classes" in javascript, I used the following resource:
// https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance
function RockPaperScissors(options) {
  Game.call(this, options);
}

RockPaperScissors.prototype = Object.create(Game.prototype);
RockPaperScissors.prototype.constructor = RockPaperScissors;

//////////////////////////////
// Subclass overrides
//////////////////////////////

RockPaperScissors.prototype.sanitizeOptions = function(options) {
  if (typeof options.numRounds != "number" || options.numRounds < 1) {
    throw new Error("numRounds should be a positive number");
  }
  return {numRounds: Math.floor(options.numRounds)};
};

RockPaperScissors.prototype.sanitizeMove = function(move) {
  if (move != "rock" && move != "paper" && move != "scissors") {
    throw new Error("move is '" + move + "' but should be 'rock', 'paper', or 'scissors'");
  }
  return move;
};

RockPaperScissors.prototype.assertMoveIsLegal = function(move, player) {
  // Any move is always legal in rock paper scissors.
};

RockPaperScissors.prototype.initialize = function(seed) {
  this.round = 0;
  this.p1Points = 0;
  this.p2Points = 0;
};

RockPaperScissors.prototype.processTurn = function(moves) {
  var p1Move = moves.get(0);
  var p2Move = moves.get(1);
  this.p1Points += winGrid[p1Move][p2Move];
  this.p2Points += winGrid[p2Move][p1Move];
  this.round += 1;
  return {
    p1Move: p1Move,
    p2Move: p2Move
  }
};

RockPaperScissors.prototype.getPlayersToPlay = function() {
  if (this.round == this.options.numRounds) {
    return new Set();
  }
  return new Set([0, 1]);
};

RockPaperScissors.prototype.getWinners = function() {
  if (this.round == this.options.numRounds) {
    var winners = new Set();
    if (this.p1Points >= this.p2Points) {
      winners.add(0);
    }
    if (this.p2Points >= this.p1Points) {
      winners.add(1);
    }
    return winners;
  }
  return new Set();
};

//////////////////////////////
// Example use
//////////////////////////////

// Expected use case
var gameInstance = new RockPaperScissors({numRounds: 5});
gameInstance.start();

gameInstance.playMove("rock", 0);
gameInstance.playMove("rock", 1);

// Order doesn't matter within the same turn (player 1 can input their move before player 0)
gameInstance.playMove("rock", 1);
gameInstance.playMove("rock", 0);

gameInstance.playMove("rock", 0);
gameInstance.playMove("paper", 1);

gameInstance.playMove("rock", 0);
gameInstance.playMove("scissors", 1);

gameInstance.playMove("rock", 0);
gameInstance.playMove("scissors", 1);
var winners = [];
for (var winner of gameInstance.getWinners()) {
  winners.push(winner);
}
console.log("Winner: " + winners); // Winner: 0

// Throws an error if invalid options
try {
  gameInstance = new RockPaperScissors({numRounds: "not a number"});
} catch(e) {
  console.log("Invalid options: " + e);
  // Invalid options: Error: numRounds should be a positive number
}

// Throws an error if invalid move
gameInstance = new RockPaperScissors({numRounds: 5});
gameInstance.start();
try {
  gameInstance.playMove("spock", 0);
} catch(e) {
  console.log("Invalid move: " + e);
  // Invalid move: Error: move is 'spock' but should be 'rock', 'paper', or 'scissors'
}

// Throws an error if playing out of turn
gameInstance = new RockPaperScissors({numRounds: 5});
gameInstance.start();
gameInstance.playMove("paper", 0);
try {
  gameInstance.playMove("rock", 0);
} catch(e) {
  console.log("Out of turn: " + e);
  // Out of turn: Error: Out of turn play by player 0: Player has already played this turn
}
