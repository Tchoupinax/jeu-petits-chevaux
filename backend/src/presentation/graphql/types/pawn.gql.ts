import { Field, ObjectType } from "@nestjs/graphql";

import { TrayCaseScalar } from "../scalars/traycase.scalar";
import { UUIDScalar } from "../scalars/uuid.scalar";

@ObjectType("Pawn")
export class PawnGQL {
  @Field(() => UUIDScalar)
  id!: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  color?: string;

  @Field(() => TrayCaseScalar, { nullable: true })
  position!: string;

  @Field(() => UUIDScalar, { nullable: true })
  playerId!: string;

  @Field(() => UUIDScalar, { nullable: true })
  gameId!: string;
}
