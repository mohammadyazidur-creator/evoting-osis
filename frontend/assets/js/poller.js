/**
 * E-Voting OSIS - Poller Service
 * Reusable polling utility with automatic background tab pause and reconnection
 */
export function createPoller({
  fn,
  interval = 3000,
  onData,
  onError,
  onStatus,
}) {
  let timer = null;
  let isRunning = false;
  let consecutiveErrors = 0;

  async function poll() {
    if (!isRunning) return;

    // Do not poll when tab is hidden to save battery & network
    if (document.hidden) {
      return;
    }

    try {
      const data = await fn();
      consecutiveErrors = 0;
      if (onStatus) onStatus(true);
      if (onData) onData(data);
    } catch (err) {
      consecutiveErrors++;
      if (onStatus) onStatus(false, err);
      if (onError) onError(err);
    } finally {
      if (isRunning) {
        timer = setTimeout(poll, interval);
      }
    }
  }

  function handleVisibilityChange() {
    if (!document.hidden && isRunning) {
      // Immediate poll upon returning to tab
      clearTimeout(timer);
      poll();
    }
  }

  return {
    start() {
      if (isRunning) return;
      isRunning = true;
      document.addEventListener('visibilitychange', handleVisibilityChange);
      poll();
    },
    stop() {
      isRunning = false;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    },
    triggerNow() {
      clearTimeout(timer);
      poll();
    },
  };
}
