const { context } = require("./context");

module.exports = (token) => {
  for (var game of Object.values(context.games)) {
    if (game.clients[token]) {
      return game;
    }
  }

  return null;
}
