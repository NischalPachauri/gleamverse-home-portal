declare global {
  interface Window {
    __errorMonitorInstalled?: boolean;
    __errorStats?: {
      network: number;
      rendering: number;
      api: number;
      unknown: number;
      logs: { type: string; message: string; ts: number; details?: unknown }[];
    };
  }
}

export function installErrorMonitor() {
  if (typeof window === 'undefined') return;
  if (window.__errorMonitorInstalled) return;
  window.__errorMonitorInstalled = true;
  const stats = (window.__errorStats = window.__errorStats || {
    network: 0,
    rendering: 0,
    api: 0,
    unknown: 0,
    logs: [],
  });

  const categorize = (msg: string, err?: unknown) => {
    const m = (msg || '').toLowerCase();
    if (m.includes('fetch') || m.includes('network') || m.includes('net::') || m.includes('failed to load resource')) return 'network';
    if (m.includes('render') || m.includes('react') || m.includes('component')) return 'rendering';
    if (m.includes('supabase') || m.includes('api') || m.includes('request')) return 'api';
    return 'unknown';
  };

  const record = (type: string, message: string, details?: unknown) => {
    stats[type as keyof typeof stats] = (stats[type as keyof typeof stats] as number) + 1;
    stats.logs.push({ type, message, ts: Date.now(), details });
    try {
      console.debug('[ErrorMonitor]', type, message);
    } catch (_err) { void 0; }
  };

  window.addEventListener('error', (e) => {
    const type = categorize(e.message || (e.error?.message ?? ''));
    record(type, e.message || 'unknown error', e.error);
  });

  window.addEventListener('unhandledrejection', (e) => {
    const msg = (e.reason && (e.reason.message || String(e.reason))) || 'unhandled rejection';
    const type = categorize(msg, e.reason);
    record(type, msg, e.reason);
  });
}
