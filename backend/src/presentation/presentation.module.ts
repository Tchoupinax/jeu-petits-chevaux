import { Module } from "@nestjs/common";

import { GraphqlModule } from "./graphql/graphql.module";
import { RestModule } from "./rest/rest.module";
import { SSEModule } from "./sse/sse.module";

@Module({
  imports: [
    RestModule,
    GraphqlModule,
    SSEModule,
  ],
})
export class PresentationModule { }
