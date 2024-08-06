import { Field, InputType } from "@nestjs/graphql";

import { UUIDScalar } from "../scalars/uuid.scalar";

@InputType()
export class ContextInputGQL {
  @Field(() => UUIDScalar)
  playerId!: string;

  @Field(() => UUIDScalar)
  gameId!: string;
}
