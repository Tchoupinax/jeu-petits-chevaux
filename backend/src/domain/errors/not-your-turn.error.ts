export class NotYourTurnError extends Error {
  statusCode = 403;

  constructor () {
    super("It's not your turn to play!");
  }
}
