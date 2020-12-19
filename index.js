if (!window.Worker) {
  document.write('<div>Your Browser is too old for this site. Try <a href="https://www.google.com/chrome/">Google Chrome</a>.</div>');
  exit;
}

let saiDifficulties = ["beginner", "easy"]
let difficultyMap = {
  "beginner": 1,
  "easy": 2,
  "hard": 1,
  "extreme": 3
}

let playerNames = {
  "b": "Black",
  "w": "White"
}

let pieceNames = {
  "p": "pawn",
  "n": "knight",
  "b": "bisop",
  "r": "rook",
  "q": "queen",
  "k": "king"
}

var board = null;
var chess = null;
var drag = true;
var lozzaEngine = null;
var lozzaStart = "startpos";
var uiStart = "start";

gameData.page = "index.html";
gameData.boardId = "board";
gameData.infoId = "#info";

function restart() {
  document.location.reload();
}

function lozUpdateBestMove() {
  var move = {};
  move.from = gameData.bmFr;
  move.to = gameData.bmTo;
  if (gameData.bmPr) {
    move.promotion = gameData.bmPr;
  }
  executeMove(move);
}

function onDrop(source, target, piece, newPos, oldPos, orientation) {
  let move = chess.move({ from: source, to: target, promotion: "q" })
  if (!move) {
    return "snapback";
  }
  if (move.flags == "e" || move.flags == "p" || move.flags == "k" || move.flags == "q") {
    board.position(chess.fen());
  }

  drag = false;
  setNotification();

  if (!chess.game_over()) {
    makeAiMove();
  }
}

function makeAiMove() {
  let difficulty = getDifficulty();
  setTimeout(function () {
    if (saiDifficulties.includes(difficulty)) {
      let move = saiGetBestMove(chess, getTurn(), difficultyMap[difficulty]);
      executeMove(move.bestMove);
    } else {
      makeLozzaMove();
    }
  }, 500);
}

function makeLozzaMove() {
  let movetime = getMoveTime() * 1000;
  lozzaEngine.postMessage("position " + lozzaStart + " moves " + strMoves());
  lozzaEngine.postMessage("go movetime " + movetime);
}

function executeMove(move) {
  chess.move(move);
  board.position(chess.fen());
  setNotification();
  if (!chess.game_over()) {
    drag = true;
  }
}

var onDragStart = function (source, piece, position, orientation) {
  if ((!drag || orientation === "white" && piece.search(/^w/) === -1) || (orientation === "black" && piece.search(/^b/) === -1)) {
    return false;
  }
  return true;
};

function strMoves() {
  var movesStr = "";
  var moves = chess.history({ verbose: true });
  for (var i = 0; i < moves.length; i++) {
    if (i) {
      movesStr += " ";
    }
    var move = moves[i];
    movesStr += move.from + move.to;
    if (move.promotion) {
      movesStr += move.promotion;
    }
  }
  return movesStr;
}

function getDifficulty() {
  let e = document.getElementById("difficulty");
  return e.options[e.selectedIndex].value;
}

function getMoveTime() {
  let moveTime = difficultyMap[getDifficulty()];
  if (moveTime == undefined || moveTime < 1 || moveTime > 10) {
    return 1;
  }
  return moveTime;
}

function getTurn() {
  return chess.fen().split(" ")[1];
}

function setNotification() {
  let moves = chess.history({ verbose: true });
  let lastMove = moves[moves.length - 1];
  var notification = ""
  if (chess.in_checkmate()) {
    notification = "Checkmate - " + playerNames[lastMove.color] + " wins!";
  } else if (chess.insufficient_material()) {
    notification = "Draw due to insufficient material";
  } else if (chess.in_draw()) {
    notification = "Draw by 50 move rule";
  } else if (chess.in_stalemate()) {
    notification = "Draw by stalemate";
  } else if (chess.in_threefold_repetition()) {
    notification = "Draw by threefold repetition";
  } else {
    if (moves.length > 0) {
      notification = playerNames[lastMove.color] + " moved " + pieceNames[lastMove.piece] +
        " from " + lastMove.from + " to " + lastMove.to;
    }
  }
  $(gameData.infoId).html(notification);
}

$(function () {
  chess = new Chess();
  board = new ChessBoard(gameData.boardId, {
    showNotation: true,
    draggable: true,
    dropOffBoard: "snapback",
    onDrop: onDrop,
    onDragStart: onDragStart,
    position: uiStart
  });

  lozzaEngine = new Worker(gameData.source);
  lozzaEngine.onmessage = lozStandardRx;
  lozzaEngine.postMessage("uci")
  lozzaEngine.postMessage("ucinewgame")
  lozzaEngine.postMessage("debug off")
});
