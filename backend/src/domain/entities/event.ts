export const eventNames = [
  "dice-launched",
  "game-created",
  "game-deleted",
  "game-finished",
  "game-player-joined",
  "game-starts",
  "message-broacast",
  "pawn-moved",
  "player-color-selection",
  "round-created",
  "traycase-updated",
] as const;

export type EventName = typeof eventNames[number];
