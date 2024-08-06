import { Color } from "../value-objects/color";

export class PlayerColorAlreadyTakenError extends Error {
  statusCode = 409;

  constructor (color: Color) {
    super(`Color ${color} is not available`);
  }
}
