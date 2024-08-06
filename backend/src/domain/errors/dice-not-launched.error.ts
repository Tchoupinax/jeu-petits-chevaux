export class DiceNotLaunchedError extends Error {
  statusCode = 403;

  constructor (roundId: string) {
    super(`The dice for round ${roundId} has not been launched`);
  }
}
