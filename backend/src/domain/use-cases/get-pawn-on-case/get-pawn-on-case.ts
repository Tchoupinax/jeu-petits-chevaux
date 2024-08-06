import { Logger } from "@nestjs/common";
import { option, taskEither } from "fp-ts";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { Option } from "fp-ts/Option";
import { Pawn } from "src/domain/entities/pawn";
import { TechnicalError } from "src/infrastructure/errors/technical.errors";
import { ValidationError } from "src/infrastructure/errors/validation.error";

export type GetPawnOnCaseUseCasePort = {
  x: number;
  y: number;
};

export class GetPawnOnCaseUseCase {
  constructor (
    private logger: Logger,
  ) { }

  execute (
    port: GetPawnOnCaseUseCasePort,
  ): TaskEither<TechnicalError | ValidationError, Option<Pawn>> {
    this.logger.debug("GetPawnOnCaseUseCase", { port });

    return taskEither.right(option.none);
  }
}
