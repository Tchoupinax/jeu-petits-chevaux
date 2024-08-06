import { z } from "zod";

export const zWhatCanIPlayInput = z.object({
  playerId: z.string().uuid(),
  roundId: z.string().uuid(),
  gameId: z.string().uuid(),
});

export type WhatCanIPlayInput = z.infer<typeof zWhatCanIPlayInput>
