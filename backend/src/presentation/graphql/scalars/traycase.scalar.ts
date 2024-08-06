import { Scalar } from "@nestjs/graphql";

@Scalar("TrayCase")
export class TrayCaseScalar {
  description = "Represents a traycase";
}
