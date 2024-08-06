import { z } from "zod";

export const zPlayerRoolsADice = z.object({
  playerId: z.string().uuid(),
  gameId: z.string().uuid(),
  roundId: z.string().uuid(),
});

export type PlayerRoolsADiceInput = z.infer<typeof zPlayerRoolsADice>
