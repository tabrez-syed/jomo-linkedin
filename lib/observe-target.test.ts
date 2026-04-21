import { describe, expect, it } from 'vitest';
import { getObserveTarget } from '~/lib/observe-target';

describe('getObserveTarget', () => {
  it('returns body when available', () => {
    const mockBody = {} as HTMLBodyElement;
    const mockDocumentElement = {} as HTMLElement;

    const target = getObserveTarget({
      body: mockBody,
      documentElement: mockDocumentElement
    });

    expect(target).toBe(mockBody);
  });

  it('falls back to documentElement when body is missing', () => {
    const mockDocumentElement = {} as HTMLElement;

    const target = getObserveTarget({
      body: null as unknown as HTMLBodyElement,
      documentElement: mockDocumentElement
    });

    expect(target).toBe(mockDocumentElement);
  });
});
