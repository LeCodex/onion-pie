function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    console.log(arr);
}

function randomKey(obj) {
    var keys = Object.keys(obj);
    return keys[ keys.length * Math.random() << 0];
};

class Game {
    io = null;
    host = null;
    gameID = null;

    clients = {};
    players = {};
    order = [];
    turn = -1;

    questions = {};
    answers = {};

    question = null;
    guess = 50;
    percent = 0;
    phase = "";
    timer = null;
    guessInterval = null;

    constructor(io, gameID, host) {
        this.io = io;
        this.gameID = gameID;
        this.host = host;

        this.host.join(this.gameID);
    }

    playerCount() {
        return Object.values(this.players).length;
    }

    currentPlayer() {
        if (this.turn === -1) return null;
        return this.players[this.order[this.turn]];
    }

    getPlayer(token) {
        return this.players[this.clients[token]];
    }

    addPlayer(socket, token, username) {
        if (this.clients[token]) return;
        
        this.clients[token] = token;
        this.players[token] = new Player(this, socket, token, username);

        socket.emit("game:joined", {gameID: this.gameID});
        this.sendPlayerList();
    }

    rejoinPlayer(token, socket) {
        if (!this.clients[token]) return;

        this.getPlayer(token).updateSocket(socket);
    }

    reconnectPlayer(oldToken, token, socket) {
        if (!this.clients[oldToken]) return;
        if (this.clients[token]) return;

        socket.emit("game:joined", {gameID: this.gameID});
        this.clients[token] = this.clients[oldToken];
        this.getPlayer(token).reconnect(token, socket);
        delete this.clients[oldToken];

        this.sendPlayerList();
    }

    removePlayer(token, update=true) {
        if (!this.clients[token]) return;

        this.getPlayer(token).quit();
        delete this.players[this.clients[token]];
        delete this.clients[token];

        if (update) this.sendPlayerList();
    }

    sendPlayerList() {
        var playerObject = {}

        for (var [token, index] of Object.entries(this.clients)) {
            const player = this.players[index];
            playerObject[token] =  {
                index: index,
                username: player.username,
                score: player.score,
                state: player.state
            }
        };

        this.host.emit("game:player list", {players: playerObject});
    }

    updatePhase(phase) {
        this.phase = phase;
        this.host.emit("game:phase", {phase: phase});
        for (var player of Object.values(this.players)) player.setPhase(phase);
    }

    start() {
        for (var index of Object.keys(this.players)) {
            this.order.push(index);
        }

        shuffleArray(this.order);
        this.turn = 0;
        
        this.host.emit("game:started", {order: this.order});
        this.getQuestions();
    }

    getQuestions() {
        this.updatePhase("questions");
    }

    checkQuestionEnd() {
        if (Object.values(this.questions).length === this.playerCount()) 
            this.startTurn();
        else
            this.sendPlayerList();
    }

    startTurn() {
        this.updatePhase("answer");
        this.host.emit("game:percent", {percent: -1});
        this.host.emit("game:goal percent", {goalPercent: -1});

        var key = randomKey(this.questions);
        this.question = this.questions[key];
        delete this.questions[key];
        
        this.io.in(this.gameID).emit("game:question", {question: this.question});

        for (var [index, player] of Object.entries(this.players)) {
            player.state = null;
            this.answers[index] = null;
        }

        this.sendPlayerList();
    }

    startTimer(duration, next) {
        if (this.timer) clearTimeout(this.timer);
        this.timerNext = next;
        this.timer = setTimeout(() => { this.timerNext(); }, duration * 1000);

        this.host.emit("game:timer", {duration: duration});
    }

    stopTimer(executeCallback=false) {
        if (!this.timer) return;
        
        clearTimeout(this.timer);
        if (executeCallback) this.timerNext();
        this.timer = null;

        this.host.emit("game:timer", {duration: -1});
    }

    checkAnswerEnd() {
        var missingAnswers = 0;
        for (var answer of Object.values(this.answers)) {
            if (answer === null) missingAnswers ++;
        }
        
        if (missingAnswers) {
            var totalAnswers = Object.values(this.answers).length;
            var givenAnswers = totalAnswers - missingAnswers;

            if (givenAnswers / totalAnswers >= .2 && !this.timer) this.startTimer(20, this.startGuess);
            this.sendPlayerList();

            return;
        }

        this.startGuess();
    }

    startGuess() {
        this.updatePhase("guess");
        this.host.to(this.gameID).emit("game:current player", {token: this.currentPlayer().token});

        for (var player of Object.values(this.players)) player.state = null;
        this.currentPlayer().state = "current"; // Current player doesn't vote

        this.startTimer(30, this.startVote);
        this.guess = 50;
        this.guessInterval = setInterval(() => {
            this.host.emit("game:percent", {percent: this.guess});
        }, 100);

        this.sendPlayerList();
    }

    getPercentFromAnswers() {
        var total = 0;
        for (var answer of Object.values(this.answers)) {
            if (answer) total++;
        }

        return Math.floor(total / Object.keys(this.answers).length * 100);
    }

    startVote(guess) {
        clearInterval(this.guessInterval);
        this.guess = guess || this.guess;
        this.host.emit("game:percent", {percent: this.guess});
        this.updatePhase("vote");

        this.percent = this.getPercentFromAnswers();
        this.stopTimer();
    }

    checkVoteEnd() {
        if (!this.timer) this.startTimer(20, this.endVote);
        
        this.sendPlayerList();
        for (var player of Object.values(this.players)) {
            if (player.state === null) {
                return;
            }
        }

        this.endVote();
    }

    endVote() {
        this.updatePhase("reveal");
        this.stopTimer();

        const diff = this.percent - this.guess;
        const absDiff = Math.abs(diff);
        for (var player of Object.values(this.players)) {
            if (
                player.state === "higher" && diff > 0 ||
                player.state === "lower" && diff < 0
            )
                player.score += 1000;
        }
        this.currentPlayer().score += (
            absDiff <= 10 ? -100 * absDiff + 3000 :
            absDiff <= 30 ? -50 * absDiff + 1550 :
            0
        );

        setTimeout(() => { this.sendPlayerList(); }, 1000);
        this.host.emit("game:goal percent", {goalPercent: this.percent});

        setTimeout(() => {
            if (Object.keys(this.questions).length) {
                this.turn = (this.turn + 1) % this.order.length;
                this.host.emit("game:turn", {turn: this.turn});
                this.startTurn();
            } else {
                this.end();
            }
        }, 5000);
    }

    end() {
        console.log(`Game ${this.gameID} ended.`)
        for (var player of Object.values(this.players)) player.state = null;
        this.sendPlayerList();
        this.host.emit("game:turn", {turn: -2});
    }

    delete() {
        for (var player of Object.values(this.players)) this.removePlayer(player.token, false);
    }
}

class Player {
    socket = null;
    game = null;
    token = "";
    username = "";
    state = null;
    score = 0;
    disconnected = false;
    phase = "";

    constructor(game, socket, token, username) {
        this.game = game;
        this.token = token;
        this.username = username;

        this.updateSocket(socket);
    }

    setPhase(phase) {
        this.phase = phase;
        this.socket.emit("game:phase", {phase: phase});
    }

    updateSocket(socket) {
        this.socket = socket;
        socket.join(this.game.gameID);
        setTimeout(() => {
            if (this.game.turn > -1) socket.emit("game:current player", {token: this.game.currentPlayer().token});
            socket.emit("game:phase", {phase: this.phase});
        }, 500);
        this.disconnected = false;
    }

    reconnect(token, socket) {
        this.token = token;
        this.updateSocket(socket);
    }

    quit() {
        this.socket.emit("game:quit");
        this.socket.leave(this.gameID);
    }
}

module.exports = Game;