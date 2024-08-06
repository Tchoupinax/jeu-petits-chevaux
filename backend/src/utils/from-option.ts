import { option } from "fp-ts";
import { Option } from "fp-ts/Option";

export function fromOption<T> (opt: Option<T>, defaultValue?: T): T {
  return option.getOrElse(() => defaultValue ?? ("" as unknown as T))(opt);
}
