var express = require('express')
var app = express()

const port = process.env.PORT || 5000
var http = require('http').createServer(app);
var io = require('socket.io')(http);

// middlewares
app.use(express.urlencoded({ extended: true }));
//app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(express.static(__dirname + '/views'));

app.listen(port, () => {
  console.log(`Server started listening on port: ${port}`);
})

app.get('/', function(req, res){
  res.render("index");
});

app.get('/chat', function(req, res){
  res.render("chat");
});

  var players = {},
    unmatched;
  
  io.sockets.on("connection", function (socket) {
      console.log("socket connected")
    socket.emit('connect',{msg:"hello"})
    joinGame(socket);
  
    console.log("user left")

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
      console.log("user left")
    });

    socket.on("disconnect", function () {
      if (getOpponent(socket)) {
        getOpponent(socket).emit("opponent.left");
      }
      console.log("user left")
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