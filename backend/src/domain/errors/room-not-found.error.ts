export class RoomNotFoundError extends Error {
  statusCode = 404;

  constructor (name: string) {
    super(`Room called ${name} is not found.`);
  }
}
