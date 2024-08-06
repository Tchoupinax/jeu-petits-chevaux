import { z } from "zod";

export const zGetPawnOnCaseInput = z.object({
  playerId: z.string().uuid(),
  gameId: z.string().uuid(),
  x: z.number(),
  y: z.number(),
});

export type GetPawnOnCaseInput = z.infer<typeof zGetPawnOnCaseInput>
