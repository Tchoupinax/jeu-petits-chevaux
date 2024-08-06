import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";

import { PlayerCommitsMoveInput, zPlayerCommitsMoveInput } from "./player-commits-move.validator";

describe("PlayerCommitsMoveValidator", () => {
  it("should correctly pass the validator if the object is correct", () => {
    const input: PlayerCommitsMoveInput = {
      roundId: randomUUID(),
      playerId: randomUUID(),
      diceScore: 1,
      pawnName: "fe",
      pawnStartingCase: "f",
      createdAt: new Date().toISOString(),
      diceLaunchedAt: new Date().toISOString(),
      pawnEndingCase: "fe",
      updatedAt: new Date().toISOString(),
      gameId: randomUUID(),
    };

    const answer = zPlayerCommitsMoveInput.safeParse(input);

    expect(answer.success).toBeTruthy();
  });

  it("should throw because the input is incorrect (gameId is missing)", () => {
    const input: Omit<PlayerCommitsMoveInput, "gameId"> = {
      roundId: randomUUID(),
      playerId: randomUUID(),
      diceScore: 1,
      pawnName: "fe",
      pawnStartingCase: "f",
      createdAt: new Date().toISOString(),
      diceLaunchedAt: new Date().toISOString(),
      pawnEndingCase: "fe",
      updatedAt: new Date().toISOString(),
    };

    const answer = zPlayerCommitsMoveInput.safeParse(input);

    expect(answer.success).toBeFalsy();
  });
});
