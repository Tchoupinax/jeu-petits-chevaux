export function isCaseIsHouse(x: number, y: number) {
  if (x < 8 && y < 7) {
    if (x < 6 && y < 6) {
      return true;
    }

    return false;
  }

  if (x < 7 && y > 6) {
    if (x < 6 && y > 8) {
      return true;
    }

    return false; 
  }

  if (x > 6 && y > 7) {
    if (x > 8 && y > 8) {
      return true;
    }

    return false;
  }

  if (x > 7 && y < 8) {
    if (x > 8 && y < 6) {
      return true;
    }

    return false;
  }

  return false;
}
