const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");
const port = 8080;

// HTML page routing
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/web/index.html"));
})

app.get("/web/index.css", function (req, res) {
  res.sendFile(path.join(__dirname + "/web/index.css"));
})

app.get("/web/index.js", function (req, res) {
  res.sendFile(path.join(__dirname + "/web/index.js"));
})

app.get("/css/chessboard-1.0.0.min.css", function (req, res) {
  res.sendFile(path.join(__dirname + "/css/chessboard-1.0.0.min.css"));
})

app.get("/js/chessboard-1.0.0.min.js", function (req, res) {
  res.sendFile(path.join(__dirname + "/js/chessboard-1.0.0.min.js"));
})

app.get("/js/lozza.js", function (req, res) {
  res.sendFile(path.join(__dirname + "/js/lozza.js"));
})

app.get("/js/lozuilib.js", function (req, res) {
  res.sendFile(path.join(__dirname + "/js/lozuilib.js"));
})

app.get("/img/chesspieces/wikipedia/:img", function (req, res) {
  let img = req.params.img;
  res.sendFile(path.join(__dirname + "/img/chesspieces/wikipedia/" + img));
})

app.get("/favicon.ico", function (req, res) {
  res.sendFile(path.join(__dirname + "/favicon.ico"));
})

app.get("/sitemap.xml", function (req, res) {
  res.sendFile(path.join(__dirname + "/sitemap.xml"));
})

app.get("/google63001e0b6d2bf67b.html", function (req, res) {
  res.sendFile(path.join(__dirname + "/google63001e0b6d2bf67b.html"));
})

// return 404 status for invalid pages - will remove from Google indexing
app.get('*', function (req, res) {
  res.sendStatus(404);
})

/* --------------------------------------------------------------- */
app.use("/", router);
app.listen(port, () => console.log(`App listening on port ${port}!`));