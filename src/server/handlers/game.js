const getGameFromToken = require("../getGameFromToken");
const { context } = require("../context");

module.exports = (io, socket) => {
    const token = socket.handshake.auth.token.toString()

    socket.on("game:start", () => {
        for (var game of Object.values(context.games)) {
            if (game.host.handshake.auth.token !== token) continue; // Client is not the host
            if (game.turn !== -1) continue; // Game started
            if (game.playerCount() < 4) continue; // Not enough players

            game.start();
            console.log(`Client ${token} started game ${game.gameID}`);
            break;
        }        
    });

    socket.on("game:questionReturn", data => {
        const game = getGameFromToken(token);
        if (!game) return; // Game does not exist
        if (game.phase !== "questions") return; // Game not in the right phase

        if (data.question.length === 0) return; // No question

        game.questions[game.clients[token]] = data.question;
        game.getPlayer(token).state = "submitted";
        game.getPlayer(token).setPhase("");
        game.checkQuestionEnd();
    });

    socket.on("game:answer", data => {
        const game = getGameFromToken(token);
        if (!game) return; // Game does not exist
        if (game.phase !== "answer") return; // Game not in the right phase

        game.answers[game.clients[token]] = data.answer;
        game.getPlayer(token).state = "submitted";
        game.getPlayer(token).setPhase("");
        game.checkAnswerEnd();
    });

    socket.on("game:guessUpdate", data => {
        const game = getGameFromToken(token);
        if (!game) return; // Game does not exist
        if (game.phase !== "guess") return; // Game not in the right phase
        if (token !== game.currentPlayer().token) return; // Player is not the one guessing

        const guess = Math.max(0, Math.min(data.guess, 100));
        game.guess = guess;
    });

    socket.on("game:guessSubmit", data => {
        const game = getGameFromToken(token);
        if (!game) return; // Game does not exist
        if (game.phase !== "guess") return; // Game not in the right phase
        if (token !== game.currentPlayer().token) return; // Player is not the one guessing

        const guess = Math.max(0, Math.min(data.guess, 100));
        game.startVote(guess);
    });

    socket.on("game:vote", data => {
        const game = getGameFromToken(token);
        if (!game) return; // Game does not exist
        if (game.phase !== "vote") return; // Game not in the right phase
        if (token === game.currentPlayer().token) return; // Player is the one guessing

        game.getPlayer(token).state = data.vote;
        game.getPlayer(token).setPhase("");
        game.checkVoteEnd();
    });

    socket.on("game:kick", data => {
        for (var game of Object.values(context.games)) {
            if (game.host.handshake.auth.token !== token) continue; // Client is not the host
            if (game.turn !== -1) continue; // Game started

            game.removePlayer(data.token);
            console.log(`Client ${data.token} was kicked from game ${game.gameID}`);
            break;
        }
    });

    socket.on("game:rejoin", data => {
        const game = getGameFromToken(token);
        if (!game) { // Client is not in a game
            socket.emit("game:quit");
            return;
        }

        game.rejoinPlayer(token, socket);
        console.log(`Client ${token} rejoined game ${game.gameID}`);
    });
}