import { pipe } from "fp-ts/function";

export function tap<A> (f: (a: A) => any) {
  return (a: A) => pipe(f(a), () => a);
}
