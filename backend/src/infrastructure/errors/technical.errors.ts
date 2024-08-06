export class TechnicalError extends Error {
  statusCode = 500;

  constructor (err: Error) {
    super(err.name);

    this.name = err.name;
    this.message = err.message;
    this.stack = err.stack;
  }
}
