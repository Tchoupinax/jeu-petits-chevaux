import { z } from "zod";

export const zSendMessageInput = z.object({
  roomId: z.string().uuid(),
  type: z.enum(["text"]),
  message: z.string(),
});

export type SendMessageInput = z.infer<typeof zSendMessageInput>
