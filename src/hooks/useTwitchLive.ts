import { useEffect, useSyncExternalStore } from 'react';

// ── Shared module-level state ──────────────────────────────────────────────
let _isLive = false;
const listeners = new Set<() => void>();

function setLive(v: boolean) {
  if (_isLive === v) return;
  _isLive = v;
  listeners.forEach(fn => fn());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

function getSnapshot() {
  return _isLive;
}

// Called by the Twitch embed inside Live.tsx once events fire
export function updateTwitchLiveStatus(live: boolean) {
  setLive(live);
}

/**
 * Returns whether the Twitch channel is currently live.
 * Use anywhere in the tree — state is shared globally.
 */
export function useTwitchLive(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}

/**
 * Hook that also accepts a callback fired when status changes.
 * Useful when you need a side-effect (e.g. logging).
 */
export function useTwitchLiveWithEffect(onChange?: (live: boolean) => void): boolean {
  const live = useTwitchLive();

  useEffect(() => {
    onChange?.(live);
  }, [live, onChange]);

  return live;
}
