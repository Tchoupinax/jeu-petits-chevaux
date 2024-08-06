export class GameAlreadyStartedError extends Error {
  statusCode = 400;

  constructor (gameId: string) {
    super(`Game ${gameId} has already been started`);
  }
}
