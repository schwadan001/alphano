// https://github.com/jhlywa/chess.js
// https://github.com/oakmac/chessboardjs/

var board = null;
var game = new Chess();

let values = {
  "p": 100,
  "k": 310,
  "b": 320,
  "r": 500,
  "q": 900
}

// Returns a numerical board evaluation. The higher the positive number, the more favorable the move
function eval(origGame, move) {
  let turnMultiplier = (origGame.fen().split(" ")[1] == "w") ? 1 : -1;
  // create copy of board and simulate move
  let newGame = new Chess(origGame.fen());
  newGame.move(move);
  // evaluate board after move
  if (newGame.in_checkmate()) {
    return Infinity;
  }
  let fen = newGame.fen();
  let pieces = fen.split(" ")[0];
  var value = 0;
  for (var x = 0; x < pieces.length; x++) {
    let char = pieces.charAt(x);
    if (values.hasOwnProperty(char.toLowerCase())) {
      let multiplier = (char == char.toUpperCase()) ? 1 : -1;
      value += values[char.toLowerCase()] * multiplier * turnMultiplier;
    }
  }
  return value;
}

function onDragStart(source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false;
}

function makeAiMove() {
  let possibleMoves = shuffle(game.moves());
  if (possibleMoves.length == 0) { // game over
    return;
  } else {
    var bestMove = null;
    var bestEval = -Infinity;
    possibleMoves.forEach(m => {
      let val = eval(game, m);
      if (val >= bestEval) {
        bestEval = val;
        bestMove = m;
      }
    })
    game.move(bestMove);
    board.position(game.fen());
    console.log(game.fen());
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

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}

board = Chessboard('board', config);

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}