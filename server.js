// server config
const PORT = process.env.PORT || 5000;

const app = require('express')

var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.listen(PORT, () => {
  console.log(`Server started listening on port: ${PORT}`);
})//test

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });
// app.use(function(req, res, next) {
//   res.status(404).send('Error 404! The Reasons this may have occured: Page not requested, or Page not found. To fix this issue, hold Ctrl + R it\'ll refresh the page.');
// });

app.use(function(req, res, next) {
    res.status(404).render("404");
});

const Connectedport = process.env.PORT || 5000;

http.listen(Connectedport)

app.get('/', function(req, res){
  res.sendFile(__dirname + '/multiplayer-tic-tac-toe.html');
});


var players = {},
  unmatched;

io.sockets.on("connection", function (socket) {
    console.log("socket connected")
  socket.emit('connect',{msg:"hello"})
  joinGame(socket);

  if (getOpponent(socket)) {
    socket.emit("game.begin", {
      symbol: players[socket.id].symbol,
    });
    getOpponent(socket).emit("game.begin", {
      symbol: players[getOpponent(socket).id].symbol,
    });
  }

  socket.on("make.move", function (data) {
    if (!getOpponent(socket)) {
      return;
    }
    socket.emit("move.made", data);
    getOpponent(socket).emit("move.made", data);
  });

  socket.on("disconnect", function () {
    if (getOpponent(socket)) {
      getOpponent(socket).emit("opponent.left");
    }
  });
});

function joinGame(socket) {
  players[socket.id] = {
    opponent: unmatched,

    symbol: "X",
    // The socket that is associated with this player
    socket: socket,
  };
  if (unmatched) {
    players[socket.id].symbol = "O";
    players[unmatched].opponent = socket.id;
    unmatched = null;
  } else {
    unmatched = socket.id;
  }
}

function getOpponent(socket) {
  if (!players[socket.id].opponent) {
    return;
  }
  return players[players[socket.id].opponent].socket;
}