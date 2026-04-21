import { describe, expect, it, vi } from 'vitest';
import { Stopwatch } from '~/components/Stopwatch';

describe('Stopwatch', () => {
  it('formats elapsed time as HH:MM:SS', () => {
    const stopwatch = new Stopwatch(3661000);
    expect(stopwatch.getFormattedTime()).toBe('01:01:01');
  });

  it('tracks elapsed time while running', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-10T10:00:00.000Z'));

    const stopwatch = new Stopwatch();
    stopwatch.start();

    vi.advanceTimersByTime(3000);
    expect(stopwatch.getElapsedMs()).toBe(3000);

    stopwatch.pause();
    vi.advanceTimersByTime(2000);
    expect(stopwatch.getElapsedMs()).toBe(3000);

    vi.useRealTimers();
  });

  it('calls tick callbacks while running', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-10T10:00:00.000Z'));

    const stopwatch = new Stopwatch();
    const callback = vi.fn();
    stopwatch.onTick(callback);
    stopwatch.start();

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledWith('00:00:01');

    stopwatch.stop();
    vi.useRealTimers();
  });
});
