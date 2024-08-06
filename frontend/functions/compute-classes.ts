export function computeClasses(color: string, x: number, y: number) {
  return `${getTextWhite(x, y)} ${getBgColor(x, y)}`
}

function getTextWhite(x: number, y: number) {
  return x === 7 || y === 7 ? '': '';
}

function getBgColor(x: number, y: number) {
  if (x < 8 && y < 7) {
    if (x < 6 && y < 6) {
      return 'yellow-house'
    }

    return 'yellow-road'
  }

  if (x < 7 && y > 6) {
    if (x < 6 && y > 8) {
      return 'blue-house'
    }

    return 'blue-road'  
  }

  if (x > 6 && y > 7) {
    if (x > 8 && y > 8) {
      return 'red-house'
    }

    return 'red-road'
  }

  if (x > 7 && y < 8) {
    if (x > 8 && y < 6) {
      return 'green-house'
    }

    return 'green-road'
  }
}
