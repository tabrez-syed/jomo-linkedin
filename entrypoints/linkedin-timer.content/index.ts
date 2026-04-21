import { Stopwatch } from '~/components/Stopwatch';
import { ScrollTracker } from '~/lib/scroll-tracker';
import { PauseGateController } from '~/lib/pause-gate-controller';
import './style.css';

const SCROLL_THRESHOLD_PX = 4500;
const SCROLL_THROTTLE_MS = 100;

export default defineContentScript({
  matches: ['*://*.linkedin.com/*'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    const stopwatch = new Stopwatch();
    const pauseGateController = new PauseGateController();
    let scrollTracker = new ScrollTracker(SCROLL_THRESHOLD_PX);
    let pageCount = 0;

    const ui = await createShadowRootUi(ctx, {
      name: 'jomo-linkedin-timer',
      position: 'overlay',
      anchor: 'body',
      onMount(container) {
        const timerDiv = document.createElement('div');
        timerDiv.className = 'timer-container';

        const timerTime = document.createElement('div');
        timerTime.className = 'timer-time';
        timerTime.textContent = stopwatch.getFormattedTime();

        timerDiv.append(timerTime);
        container.append(timerDiv);

        stopwatch.onTick((time) => {
          timerTime.textContent = time;
        });

        return { timerTime };
      },
      onRemove() {
        stopwatch.stop();
      }
    });

    ui.mount();

    let scrollTimeout: number | null = null;
    const handleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = window.setTimeout(() => {
        scrollTracker.handleScroll();
        scrollTimeout = null;
      }, SCROLL_THROTTLE_MS);
    };

    const setupScrollTracking = () => {
      scrollTracker.onThresholdReached(() => {
        if (pauseGateController.isActive()) return;
        pageCount += 1;
        const shown = pauseGateController.show({
          pageCount,
          formattedDuration: stopwatch.getFormattedTime(),
          onDoneForNow: () => {
            stopwatch.pause();
          }
        });
        if (!shown) {
          pageCount -= 1;
        }
      });
    };

    setupScrollTracking();

    const startSession = () => {
      if (!document.hidden) {
        stopwatch.start();
        window.addEventListener('scroll', handleScroll, { passive: true });
      }
    };

    const stopScroll = () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
        scrollTimeout = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopwatch.pause();
        stopScroll();
        pauseGateController.cleanup();
      } else {
        stopwatch.resume();
        window.addEventListener('scroll', handleScroll, { passive: true });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    startSession();

    ctx.onInvalidated(() => {
      stopwatch.stop();
      stopScroll();
      pauseGateController.cleanup();
      scrollTracker.clearCallbacks();
      document.removeEventListener('visibilitychange', handleVisibility);
    });
  }
});
