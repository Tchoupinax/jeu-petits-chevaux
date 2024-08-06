/* eslint-disable @typescript-eslint/no-explicit-any */
export class ValidationError extends Error {
  public errors: any;

  constructor (errors: any) {
    super("ValidationError");

    this.errors = errors;
  }
}
