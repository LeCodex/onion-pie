const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const registerJoinMenuHandlers = require("./src/server/handlers/joinMenu");
const registerGameHandlers = require("./src/server/handlers/game");

const { context } = require("./src/server/context");

const app = express();
app.use(index);

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
  const token = socket.handshake.auth.token.toString()
  console.log(`New client connected ${token}`);
  
  registerJoinMenuHandlers(io, socket);
  registerGameHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log(`Client disconnected ${token}`);

    for (var game of Object.values(context.games)) {
      if (game.host.handshake.auth.token == token) {
        game.delete();
        delete context.games[game.gameID];
        break;
      }

      if (game.clients[token]) {
        game.getPlayer(token).disconnected = true;
        console.log(`Disconnected ${game.getPlayer(token).disconnected}`);
      }
    }
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
