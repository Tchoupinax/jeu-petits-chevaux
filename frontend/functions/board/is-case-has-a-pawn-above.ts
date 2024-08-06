import type { Pawn } from "~~/app/domain/entities/pawn";
import { Option } from "@swan-io/boxed";
import { Rest } from "../../services/rest";

export async function isCaseHasAPawnAbove(
  rest: Rest,
  x: number,
  y: number
): Promise<Option<Pawn>> {
  return rest.returnPawnOnCase(x, y);
}
