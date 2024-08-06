import { isCaseIsPublicPath } from './is-case-is-public-path'

export function getPublicPathCasesCoordinates(): Array<{ x: number, y: number }> {
  const array: Array<{ x: number, y: number }> = [];

  for (let x = 0; x < 15; x++) {
    for(let y = 0; y < 15; y++) {
      if (isCaseIsPublicPath(x, y)) {
        array.push({ x, y });
      }
    }
  }

  return array;
}
 