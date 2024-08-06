import { Scalar } from "@nestjs/graphql";
import { ASTNode, Kind } from "graphql";

@Scalar("UUID")
export class UUIDScalar {
  description = "Represents a UUID v4";

  public parseValue (value: string): string {
    if (!this.isUUID(value)) {
      throw new TypeError(`UUID cannot represent non-UUID value: ${value}`);
    }

    return value.toLowerCase();
  }

  public serialize (value: string): string {
    return this.parseValue(value);
  }

  public parseLiteral (ast: ASTNode): string | undefined {
    if (ast.kind !== Kind.STRING || !this.isUUID(ast.value)) {
      return undefined;
    }

    return ast.value;
  }

  private isUUID (value: string): boolean {
    return value.match(/^[0-9(a-f|A-F)]{8}-[0-9(a-f|A-F)]{4}-4[0-9(a-f|A-F)]{3}-[89ab][0-9(a-f|A-F)]{3}-[0-9(a-f|A-F)]{12}$/) !== null;
  }
}
