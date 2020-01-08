const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");
const Ai = require("./ai.js");
const port = 8080;

// HTML page routing
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/web/index.html"));
})

/* Host files for internal and external reference */
app.get("/sitemap.xml", function (req, res) {
  res.sendFile(path.join(__dirname + "/sitemap.xml"));
})

app.get("/google63001e0b6d2bf67b.html", function (req, res) {
  res.sendFile(path.join(__dirname + "/google63001e0b6d2bf67b.html"));
})

app.get("/favicon.ico", function (req, res) {
  res.sendFile(path.join(__dirname + "/favicon.ico"));
})

app.get("/web/index.css", function (req, res) {
  res.sendFile(path.join(__dirname + "/web/index.css"));
})

app.get("/web/index.js", function (req, res) {
  res.sendFile(path.join(__dirname + "/web/index.js"));
})

app.get("/css/chessboard-1.0.0.min.css", function (req, res) {
  res.sendFile(path.join(__dirname + "/chessboard/css/chessboard-1.0.0.min.css"));
})

app.get("/js/chessboard-1.0.0.min.js", function (req, res) {
  res.sendFile(path.join(__dirname + "/chessboard/js/chessboard-1.0.0.min.js"));
})

app.get("/img/chesspieces/wikipedia/:img", function (req, res) {
  let img = req.params.img;
  res.sendFile(path.join(__dirname + "/chessboard/img/chesspieces/wikipedia/" + img));
})


/* Handle GET requests for game actions */
app.get("/api/ai/:fen", function (req, res) {
  let fen = req.params.fen.split("|").join("/");
  Ai.getAiMove(fen, 2, function(move) {
    res.send({"move": move});
  })
})


// return 404 status for invalid pages - will remove from Google indexing
app.get('*', function (req, res) {
  res.sendStatus(404);
})

/* --------------------------------------------------------------- */
app.use("/", router);
app.listen(port, () => console.log(`App listening on port ${port}!`));