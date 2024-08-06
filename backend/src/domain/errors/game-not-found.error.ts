export class GameNotFoundError extends Error {
  statusCode = 404;

  constructor (gameId: string) {
    super(`Game ${gameId} is not found`);
  }
}
