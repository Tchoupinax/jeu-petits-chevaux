import { z } from "zod";

import { zDefaultContextInput } from "../validators/default-context.validator";

export type ContextInput = z.infer<typeof zDefaultContextInput>
