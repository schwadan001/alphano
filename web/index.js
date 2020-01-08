// https://github.com/jhlywa/chess.js
// https://github.com/oakmac/chessboardjs/

var board = null;
var game = new Chess();
var counter = 0;

let values = {
  "p": 100,
  "n": 310,
  "b": 320,
  "r": 500,
  "q": 900
}

// Returns a numerical board evaluation. The higher the positive number, the more favorable the move
function eval(origGame, move, perspective) {
  let turnMultiplier = (perspective == "w") ? 1 : -1;
  // create copy of board and simulate move
  let newGame = new Chess(origGame.fen());
  newGame.move(move);
  // evaluate board after move
  if (newGame.in_checkmate()) {
    return Infinity * turnMultiplier;
  }
  let fen = newGame.fen();
  let pieces = fen.split(" ")[0];
  var value = 0;
  for (var x = 0; x < pieces.length; x++) {
    let char = pieces.charAt(x);
    if (values.hasOwnProperty(char.toLowerCase())) {
      let colorMultiplier = (char == char.toUpperCase()) ? 1 : -1;
      value += values[char.toLowerCase()] * colorMultiplier * turnMultiplier;
    }
  }
  // discourage stalemate if we're ahead; encourage if we're behind
  if (newGame.in_stalemate()) {
    value += ((value > 0) ? -10 : 10);
  }
  return value;
}

function onDragStart(source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // only pick up pieces for white
  if (piece.search(/^b/) !== -1) return false;
}

// level param specifies the number of searches deep
function getBestMove(origGame, perspective, maxLevel, level = 1) {
  let maximize = (level % 2 != 0);
  counter += 1;
  let possibleMoves = shuffle(origGame.moves());
  if (possibleMoves.length == 0) { // game over
    throw Error("There are no valid moves");
  } else {
    var bestMove;
    var bestEval = (maximize ? -Infinity : Infinity);
    possibleMoves.forEach(m => {
      var val;
      if (level == maxLevel) {
        val = eval(origGame, m, perspective);
      } else {
        let newGame = new Chess(origGame.fen());
        newGame.move(m);
        val = getBestMove(newGame, perspective, maxLevel, level + 1)[1];
      }
      if (maximize ? val >= bestEval : val <= bestEval) {
        bestEval = val;
        bestMove = m;
      }
    })
    return [bestMove, bestEval];
  }
}

function makeAiMove() {
  if (!game.game_over()) {
    let bestMove = getBestMove(game, game.fen().split(" ")[1], 2)
    game.move(bestMove[0]);
    board.position(game.fen());
  }
}

function onDrop(source, target, piece, newPos, oldPos, orientation) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for simplicity
  })

  // illegal move
  if (move === null) return 'snapback';

  // make legal move for black
  window.setTimeout(makeAiMove, 250);
}

// update the board position after the piece snap for castling, en passant, pawn promotion
function onSnapEnd() {
  board.position(game.fen());
}

function shuffle(arr) {
  var j, x, i;
  for (i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = arr[i];
    arr[i] = arr[j];
    arr[j] = x;
  }
  return arr;
}

function getSquareNames() {
  var b = [];
  let dim = 8;
  for (j = dim; j > 0; j--) {
    var column = [];
    for (i = 97; i < 97 + dim; i++) {
      column.push(String.fromCharCode(i) + j.toString());
    }
    b.push(column);
  }
  return b;
}

function getBoardSquares() {
  return getSquareNames().map(r => r.map(c => {
    let square = game.get(c);
    if (square == null) {
      return square;
    } else {
      let type = square["type"]
      return ((square["color"] == "w") ? type.toUpperCase() : type);
    }
  }));
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}

board = Chessboard('board', config);
