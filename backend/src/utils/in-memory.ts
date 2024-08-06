import { array, option, taskEither } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { id } from "fp-ts/lib/Refinement";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { Option } from "fp-ts/Option";

import { TechnicalError } from "../infrastructure/errors/technical.errors";

export class InMemory<T extends { id: string }> {
  public entities : Array<T>;

  constructor (entities: Array<T> = []) {
    this.entities = entities;
  }

  getOne (id: string): TaskEither<TechnicalError, T> {
    return pipe(
      this.entities,
      array.findFirst(entity => entity.id === id),
      taskEither.fromOption(() => new TechnicalError(new Error("d"))),
    );
  }

  findOne (id: string): TaskEither<TechnicalError, Option<T>> {
    return pipe(
      this.entities,
      array.findFirst(entity => entity.id === id),
      taskEither.of,
    );
  }

  create (entity: T): TaskEither<TechnicalError, T> {
    this.entities.push(entity);
    return taskEither.right(entity);
  }

  update (entity: T) : TaskEither<TechnicalError, T> {
    return pipe(
      this.entities,
      array.findIndex(currentEntity => currentEntity.id === entity.id),
      option.fold(
        () => taskEither.left(new TechnicalError(new Error(`InMemory entity with id ${id} was not found`))),
        index => {
          this.entities[index] = {
            ...this.entities[index],
            ...entity,
          };
          return taskEither.right(this.entities[index]);
        },
      ),
    );
  }
}
