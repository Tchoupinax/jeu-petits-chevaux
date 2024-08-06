export class PlayerAlreadyExistsError extends Error {
  statusCode = 422;

  constructor (nickname: string) {
    super(`Nickname ${nickname} is not available`);
  }
}
