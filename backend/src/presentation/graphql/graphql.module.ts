import { YogaDriver, YogaDriverConfig } from "@graphql-yoga/nestjs";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "path";

import { DomainModule } from "../../domain/domain.module";
import { ContextInputGQL } from "./inputs/context.input.gql";
import { PawnResolvers } from "./resolvers/pawns.resolver";
import { TrayCaseScalar } from "./scalars/traycase.scalar";
import { UUIDScalar } from "./scalars/uuid.scalar";

const scalars = [
  TrayCaseScalar,
  UUIDScalar,
];

const gqlInputs = [
  ContextInputGQL,
];

const resolvers = [
  PawnResolvers,
];

@Module({
  imports: [
    GraphQLModule.forRoot<YogaDriverConfig>({
      driver: YogaDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      graphiql: true,
    }),
    DomainModule,
  ],
  providers: [
    ...resolvers,
    ...scalars,
    ...gqlInputs,
  ],
})
export class GraphqlModule {}
