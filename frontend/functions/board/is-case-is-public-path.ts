import { isCaseIsStair } from "./is-case-is-stair";

export function isCaseIsPublicPath(x: number, y: number): boolean {
  if (isCaseIsStair(x, y)) {
    return false;
  }

  if (x < 8 && y < 7) {
    if (x < 6 && y < 6) {
      return false;
    }

    return true;
  }

  if (x < 7 && y > 6) {
    if (x < 6 && y > 8) {
      return false;
    }

    return true;
  }

  if (x > 6 && y > 7) {
    if (x > 8 && y > 8) {
      return false;
    }

    return true;
  }

  if (x > 7 && y < 8) {
    if (x > 8 && y < 6) {
      return false;
    }

    return true;
  }

  return false;
}