// https://github.com/jhlywa/chess.js
// https://github.com/oakmac/chessboardjs/

var board = null;
var game = new Chess();

function onDragStart(source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // only pick up pieces for white
  if (piece.search(/^b/) !== -1) return false;
}

function makeAiMove() {
  if (!game.game_over()) {
    $.getJSON("/api/ai/" + game.fen().split("/").join("|"), function (data, status) {
      let move = data.move;
      if (move != "") {
        game.move(move);
        board.position(game.fen());
      }
    });
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

let config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}

board = Chessboard('board', config);
