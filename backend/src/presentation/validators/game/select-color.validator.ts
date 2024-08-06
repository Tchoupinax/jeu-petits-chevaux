import { z } from "zod";

export const zSelectColorPayload = z.object({
  playerId: z.string().uuid(),
  gameId: z.string().uuid(),
  color: z.string(),
});

export type SelectColorPayload = z.infer<typeof zSelectColorPayload>
