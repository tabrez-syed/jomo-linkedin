type StopwatchState = 'stopped' | 'running' | 'paused';

export class Stopwatch {
  private elapsedMs: number;
  private lastStartTime: number = 0;
  private state: StopwatchState = 'stopped';
  private intervalId: number | null = null;
  private callbacks: Set<(time: string) => void> = new Set();

  constructor(initialElapsedMs: number = 0) {
    this.elapsedMs = initialElapsedMs;
  }

  start() {
    if (this.state === 'running') return;

    this.state = 'running';
    this.lastStartTime = Date.now();

    this.intervalId = window.setInterval(() => {
      this.notify();
    }, 1000);
  }

  pause() {
    if (this.state !== 'running') return;

    this.state = 'paused';
    this.elapsedMs += Date.now() - this.lastStartTime;

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resume() {
    if (this.state !== 'paused') return;

    this.state = 'running';
    this.lastStartTime = Date.now();

    this.intervalId = window.setInterval(() => {
      this.notify();
    }, 1000);
  }

  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.state = 'stopped';
  }

  getElapsedMs(): number {
    if (this.state === 'running') {
      return this.elapsedMs + (Date.now() - this.lastStartTime);
    }
    return this.elapsedMs;
  }

  getFormattedTime(): string {
    const totalSeconds = Math.floor(this.getElapsedMs() / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getState(): StopwatchState {
    return this.state;
  }

  onTick(callback: (time: string) => void) {
    this.callbacks.add(callback);
  }

  clearCallbacks() {
    this.callbacks.clear();
  }

  private notify() {
    const time = this.getFormattedTime();
    this.callbacks.forEach(cb => cb(time));
  }
}
