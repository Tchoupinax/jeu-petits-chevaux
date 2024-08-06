export class PlayerNotFoundError extends Error {
  statusCode = 404;

  constructor (playerId: string) {
    super(`Player ${playerId} is not available`);
  }
}
