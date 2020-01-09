// https://github.com/jhlywa/chess.js

var Chess = require('chess.js').Chess;

module.exports = {
    getAiMove: getAiMove,
}

var counter = 0;
var pruned = 0;

let values = {
    "p": 100,
    "n": 310,
    "b": 320,
    "r": 500,
    "q": 900
}

// returns a numerical board evaluation from a player's perspective
// higher positive numbers are more favorable 
function eval(board, perspective) {
    let turnMultiplier = (perspective == "w") ? 1 : -1;
    if (board.in_checkmate()) {
        return Infinity * turnMultiplier;
    }
    let fen = board.fen();
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
    if (board.in_stalemate()) {
        value += ((value > 0) ? -10 : 10);
    }
    return value;
}

// level param specifies the number of searches deep
function getBestMove(origGame, perspective, maxLevel, level = 1, bestEvals = {}) {
    let maximize = (level % 2 != 0);
    let possibleMoves = shuffle(origGame.moves());
    if (possibleMoves.length == 0) { // game over
        throw Error("There are no valid moves");
    } else {
        var bestMove;
        var bestEval = (maximize ? -Infinity : Infinity);
        for (var i = 0; i < possibleMoves.length; i++) {
            counter += 1;
            let m = possibleMoves[i];
            var val;
            let newGame = new Chess(origGame.fen());
            newGame.move(m);
            if (level == maxLevel || newGame.game_over()) {
                val = eval(newGame, perspective);
            } else {
                result = getBestMove(newGame, perspective, maxLevel, level + 1, bestEvals);
                val = result.bestEval;
            }
            let pruneVal = bestEvals[level - 1];
            if (pruneVal != undefined && (maximize ? val < pruneVal : val < pruneVal)) {
                pruned += (possibleMoves.length - 1 - i) ** (maxLevel - level + 1);
                return { "bestMove": m, "bestEval": val };
            }
            if (bestEvals[level] == undefined || (maximize ? val >= bestEvals[level] : val <= bestEvals[level])) {
                bestEvals[level] = val;
            }
            if (maximize ? val >= bestEval : val <= bestEval) {
                bestMove = m;
                bestEval = val;
            }
        }
        return { "bestMove": bestMove, "bestEval": bestEval };
    }
}

function getAiMove(fen, depth, callback) {
    let game = new Chess(fen);
    var move;
    if (game.validate_fen(fen)['valid'] && !game.game_over()) {
        pruned = 0;
        counter = 0;
        move = getBestMove(game, game.fen().split(" ").bestEval, depth).bestMove;
    } else {
        move = "";
    }
    callback(move);
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
