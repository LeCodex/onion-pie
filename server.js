const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require('body-parser');
const path = require('path');

const port = process.env.PORT || 3000;
const index = require("./routes/index");

const app = express();
// app.use(index);
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());

const fs = require("fs");
const cmd = require('node-cmd');
const crypto = require('crypto');

const onWebhook = (req, res) => {
	let hmac = crypto.createHmac('sha1', process.env.SECRET);
	let sig = `sha1=${hmac.update(JSON.stringify(req.body)).digest('hex')}`;

	if (req.headers['x-github-event'] === 'push' && sig === req.headers['x-hub-signature']) {
		cmd.run('chmod 777 ./git.sh');

		cmd.run('./git.sh', (err, data) => {
			if (data) {
				console.log(data);
			}
			if (err) {
				console.log(err);
			}
		})

		cmd.run('refresh');
	}

	return res.sendStatus(200);
}

app.post('/git', onWebhook);

const registerJoinMenuHandlers = require("./src/server/handlers/joinMenu");
const registerGameHandlers = require("./src/server/handlers/game");

const { context } = require("./src/server/context");

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
      }
    }
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
