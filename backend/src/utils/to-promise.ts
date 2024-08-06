import { task, taskEither } from "fp-ts";
import { identity, pipe } from "fp-ts/function";

type ErrorFunction<E, R> = (err: E) => task.Task<R> | never;

export async function toPromise<E, T>(input: taskEither.TaskEither<E, T>): Promise<T>;
export async function toPromise<E, T, R>(
  input: taskEither.TaskEither<E, T>,
  transformation: (data: T) => R,
  onError?: ErrorFunction<E, R>,
): Promise<R>;
export async function toPromise<E, T, R> (
  input: taskEither.TaskEither<E, T>,
  transformation: (data: T) => T | R = identity,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  onError: ErrorFunction<E, T | R> = err => {
    // eslint-disable-next-line no-throw-literal
    throw err as unknown as Error;
  },
): Promise<T | R> {
  return await pipe(input, taskEither.map(transformation), taskEither.getOrElse(onError))();
}
