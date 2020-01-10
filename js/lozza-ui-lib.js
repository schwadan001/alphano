if (typeof console == "undefined") {
    this.console = { log: function () { } };
}

var gameData = {};

gameData.next = 0; // next board id
gameData.hashFull = 0;
gameData.mvNum = 0;
gameData.mvStr = '';
gameData.source = 'js/lozza.min.js';

function lozGetStr(key, def) {
    for (var i = 0; i < gameData.tokens.length; i++)
        if (gameData.tokens[i] == key)
            return gameData.tokens[i + 1];
    return def;
}

function lozStandardRx(e) {
    gameData.message = e.data;
    gameData.message = gameData.message.trim();
    gameData.message = gameData.message.replace(/\s+/g, ' ');
    gameData.tokens = gameData.message.split(' ');

    if (gameData.tokens[0] == 'bestmove') {
        gameData.bm = lozGetStr('bestmove', '');
        gameData.bmFr = gameData.bm[0] + gameData.bm[1];
        gameData.bmTo = gameData.bm[2] + gameData.bm[3];
        if (gameData.bm.length > 4)
            gameData.bmPr = gameData.bm[4];
        else
            gameData.bmPr = '';
        lozUpdateBestMove();
    } else {
        gameData.info = gameData.message;
    }
}

function lozUpdateBestMove() { }
