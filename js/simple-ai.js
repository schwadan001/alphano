let saiPieceValues = {
    "p": 100,
    "n": 310,
    "b": 320,
    "r": 500,
    "q": 900
}

// returns a numerical board evaluation from a player's perspective
// higher positive numbers are more favorable 
function saiEval(board, perspective) {
    let turnMultiplier = (perspective == "w") ? 1 : -1;
    if (board.in_checkmate()) {
        return Infinity * turnMultiplier;
    }
    let fen = board.fen();
    let pieces = fen.split(" ")[0];
    var value = 0;
    for (var x = 0; x < pieces.length; x++) {
        let char = pieces.charAt(x);
        if (saiPieceValues.hasOwnProperty(char.toLowerCase())) {
            let colorMultiplier = (char == char.toUpperCase()) ? 1 : -1;
            value += saiPieceValues[char.toLowerCase()] * colorMultiplier * turnMultiplier;
        }
    }
    // discourage stalemate if we're ahead; encourage if we're behind
    if (board.in_stalemate()) {
        value += ((value > 0) ? -10 : 10);
    }
    return value;
}

function saiGetBestMove(origGame, perspective, maxPly, ply = 1, bestEvals = {}) {
    let maximize = (ply % 2 != 0);
    let possibleMoves = saiShuffle(origGame.moves());
    if (possibleMoves.length == 0) { // game over
        throw Error("There are no valid moves");
    } else {
        var bestMove;
        var bestEval = (maximize ? -Infinity : Infinity);
        for (var i = 0; i < possibleMoves.length; i++) {
            let m = possibleMoves[i];
            var val;
            let newGame = new Chess(origGame.fen());
            newGame.move(m);
            if (ply == maxPly || newGame.game_over()) {
                val = saiEval(newGame, perspective);
            } else {
                result = saiGetBestMove(newGame, perspective, maxPly, ply + 1, bestEvals);
                val = result.bestEval;
            }
            let pruneVal = bestEvals[ply - 1];
            if (pruneVal != undefined && (maximize ? val < pruneVal : val < pruneVal)) {
                return { "bestMove": m, "bestEval": val };
            }
            if (bestEvals[ply] == undefined || (maximize ? val >= bestEvals[ply] : val <= bestEvals[ply])) {
                bestEvals[ply] = val;
            }
            if (maximize ? val >= bestEval : val <= bestEval) {
                bestMove = m;
                bestEval = val;
            }
        }
        return { "bestMove": bestMove, "bestEval": bestEval };
    }
}

function saiShuffle(arr) {
    var j, x, i;
    for (i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = arr[i];
        arr[i] = arr[j];
        arr[j] = x;
    }
    return arr;
}
