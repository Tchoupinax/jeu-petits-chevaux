import { not } from "../not";

export function isCaseIsStair (x: number, y: number): boolean {
  if (
    (x === 7 || y === 7) &&
      not(
        (
          isParadise(x, y) ||
          isTopPublicPath(x, y) ||
          isBottomPublicPath(x, y) ||
          isLeftPublicPath(x, y) ||
          isRightPublicPath(x, y)
        ),
      )
  ) {
    return true;
  }

  return false;
}

function isTopPublicPath (x: number, y: number): boolean {
  return x === 0 && y === 7;
}

function isBottomPublicPath (x: number, y: number): boolean {
  return x === 14 && y === 7;
}

function isLeftPublicPath (x: number, y: number): boolean {
  return x === 7 && y === 0;
}

function isRightPublicPath (x: number, y: number): boolean {
  return x === 7 && y === 14;
}

function isParadise (x: number, y: number): boolean {
  return x === 7 && y === 7;
}
