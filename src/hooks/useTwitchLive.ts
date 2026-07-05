import { useEffect, useSyncExternalStore } from 'react';

// ── Shared module-level state ──────────────────────────────────────────────
let _isLive = false;
let _polling = false;
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

/** Poll the Twitch Helix API to check if the channel is live. */
async function checkLiveStatus(): Promise<void> {
  try {
    const tokenRes = await fetch('/api/twitch-token');
    if (!tokenRes.ok) return;
    const { token, clientId } = await tokenRes.json();

    const streamRes = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=fawzz_tv`,
      {
        headers: { 'Client-ID': clientId, Authorization: `Bearer ${token}` },
      },
    );
    if (!streamRes.ok) return;
    const data = await streamRes.json();
    setLive((data?.data?.length ?? 0) > 0);
  } catch {
    // Silently ignore — Twitch API may be unavailable
  }
}

/** Start polling Twitch live status (idempotent — only starts once). */
function startPolling() {
  if (_polling) return;
  _polling = true;
  checkLiveStatus();
  setInterval(checkLiveStatus, 60_000);
}

// Called by the Twitch embed inside Live.tsx once events fire
export function updateTwitchLiveStatus(live: boolean) {
  setLive(live);
}

/**
 * Returns whether the Twitch channel is currently live.
 * Use anywhere in the tree — state is shared globally.
 * Starts polling the Twitch API automatically on first use.
 */
export function useTwitchLive(): boolean {
  useEffect(() => {
    startPolling();
  }, []);
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
