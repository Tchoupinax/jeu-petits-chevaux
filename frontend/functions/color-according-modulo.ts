export function getColorAccordingPosition(x: number, y: number): string {
  switch(true) {
    case x < 8 && y < 7:
      return "yellow"
    case x >= 7 && y >= 8 :
      return "red"
      case x < 7 && y >= 7:
      return "cyan"
    case x >= 8 && y < 8 :
      return "green"
  }

  return "black"
}
