import { z } from "zod";

export const zDefaultContextInput = z.object({
  playerId: z.string().uuid(),
  gameId: z.string().uuid(),
});
