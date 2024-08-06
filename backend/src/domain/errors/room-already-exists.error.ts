export class RoomAlreadyExistsError extends Error {
  statusCode = 422;

  constructor (roomName: string) {
    super(`Room ${roomName} is not available`);
  }
}
