/**
 * E-Voting OSIS - Screen Wake Lock Service
 * Keeps device screen awake (for bilik suara phone and live TV/phone)
 */
let wakeLock = null;

export async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
      });
      // Re-acquire if visibility changes back to visible
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return true;
    } catch (err) {
      console.warn('Screen WakeLock error:', err.message);
      return false;
    }
  }
  return false;
}

export function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange);
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible' && !wakeLock) {
    requestWakeLock();
  }
}
