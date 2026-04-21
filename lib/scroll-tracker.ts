/**
 * Scroll Tracker - Tracks cumulative scroll distance and triggers callbacks at thresholds
 *
 * Similar to the Stopwatch component, this uses an observer pattern to notify
 * when scroll distance thresholds are reached (e.g., every 4500px).
 *
 * Session-based: State resets on page reload (no persistence needed).
 */
export class ScrollTracker {
  private accumulatedScrollPx: number = 0;
  private lastScrollY: number;
  private thresholdPx: number;
  private thresholdCallbacks: Set<(scrollDistance: number) => void> = new Set();
  private nextThreshold: number;

  /**
   * Create a scroll tracker with a distance threshold.
   *
   * @param thresholdPx - Distance in pixels before triggering callbacks (e.g., 4500)
   */
  constructor(thresholdPx: number) {
    this.thresholdPx = thresholdPx;
    this.nextThreshold = thresholdPx;
    this.lastScrollY = window.scrollY; // Initialize at construction time, not module load time
  }

  /**
   * Call this on scroll events to accumulate distance.
   * Triggers callbacks when threshold is reached.
   *
   * Note: Should be throttled externally to avoid excessive calls.
   */
  handleScroll(): void {
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - this.lastScrollY;

    // Only count scrolling DOWN (positive delta), ignore scrolling up
    if (deltaY > 5) {
      this.accumulatedScrollPx += deltaY;
      this.lastScrollY = currentScrollY;

      // Check if threshold reached
      if (this.accumulatedScrollPx >= this.nextThreshold) {
        this.notifyThresholdReached();
        this.nextThreshold += this.thresholdPx; // Set next threshold (4500, 9000, 13500, ...)
      }
    } else if (deltaY < -5) {
      // User scrolled up - just update position without counting
      this.lastScrollY = currentScrollY;
    }
  }

  /**
   * Register a callback to be called when scroll threshold is reached.
   * Follows the observer pattern used in Stopwatch.onTick().
   *
   * @param callback - Function called with accumulated scroll distance
   */
  onThresholdReached(callback: (scrollDistance: number) => void): void {
    this.thresholdCallbacks.add(callback);
  }

  /**
   * Get the current accumulated scroll distance.
   *
   * @returns Total pixels scrolled in this session
   */
  getAccumulatedDistance(): number {
    return this.accumulatedScrollPx;
  }

  /**
   * Clear all registered callbacks (for cleanup/memory management).
   */
  clearCallbacks(): void {
    this.thresholdCallbacks.clear();
  }

  /**
   * Notify all registered callbacks that threshold was reached.
   */
  private notifyThresholdReached(): void {
    this.thresholdCallbacks.forEach(cb => cb(this.accumulatedScrollPx));
  }
}
