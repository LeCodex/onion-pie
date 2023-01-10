const Game = require("../game/game");
const getGameFromToken = require("../getGameFromToken");
const { context } = require("../context");

function randomID(length) {
    // Declare all characters
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Pick characters randomly
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
}

module.exports = (io, socket) => {
    const token = socket.handshake.auth.token

    socket.on("game:join", data => {
        if (getGameFromToken(token)) return; // Client is already in game
        
        const username = data.username.trim();
        if (data.gameID.length !== 4) { socket.emit("game:message", "Please enter a room code"); return; } // Not a full room code
        if (username.length === 0) { socket.emit("game:message", "Please enter a username"); return; } // No username

        const gameID = data.gameID;
        const game = context.games[gameID];
        if (!game) { socket.emit("game:message", "No game with that code"); return; } // Game does not exist

        for (var player of Object.values(game.players)) {
            if (player.username === username) { // Player already is in a game, reconnect
                if (!player.disconnected) {console.log(`Client ${token} is trying the same username ${username}`); return; } // A player with the same username is connected

                game.reconnectPlayer(player.token, token, socket);
                console.log(`Client ${token} rejoined game ${gameID} after deconnection as ${player.token}`);
                return;
            }
        }

        if (game.turn !== -1) { socket.emit("game:message", "No game with that code"); return; } // Game started
        if (game.playerCount() >= 20) { socket.emit("game:message", "Game is full"); return; } // Game is full

        game.addPlayer(socket, token, username);
        console.log(`Client ${token} joined game ${gameID}`);
    });

    socket.on("game:create", data => {
        if (getGameFromToken(token)) return; // Client is already in a game
        
        do {
            var gameID = randomID(4);
        } while (context.games[gameID]);
        if (context.games[gameID]) return; // Game already exists

        socket.emit("game:created", {gameID: gameID});
        context.games[gameID] = new Game(io, gameID, socket);

        console.log(`Client ${token} created game ${gameID}`);
    });
}