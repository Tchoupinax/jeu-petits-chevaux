import { describe, expect, it } from 'vitest';
import { getPublicPathCasesCoordinates } from './get-public-path-cases-coordinates';

describe('getPublicPathCasesCoordinates', () => {
  it('should correctly call the function', () => {
    const answer = getPublicPathCasesCoordinates();

    expect(answer.length).toBe(14 * 4);
    expect(answer[0].x).not.toBeNull();
    expect(answer[0].y).not.toBeNull();
  });
});
