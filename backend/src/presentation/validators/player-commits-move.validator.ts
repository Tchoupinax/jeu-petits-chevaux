import { isISODate } from "src/utils/is-iso-date";
import { z } from "zod";

export const zPlayerCommitsMoveInput = z.object({
  roundId: z.string().uuid(),
  playerId: z.string().uuid(),
  gameId: z.string().uuid(),
  diceScore: z.number().nullable(),
  pawnName: z.string().nullable(),
  pawnStartingCase: z.string().nullable(),
  pawnEndingCase: z.string().nullable(),
  diceLaunchedAt: z.string()
    .refine(isISODate, { message: "Not a valid ISO string date " })
    .nullable(),
  createdAt: z.string()
    .refine(isISODate, { message: "Not a valid ISO string date " })
    .nullable(),
  updatedAt: z.string()
    .refine(isISODate, { message: "Not a valid ISO string date " })
    .nullable(),
});

export type PlayerCommitsMoveInput = z.infer<typeof zPlayerCommitsMoveInput>
