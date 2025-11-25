interface ErrorPayload {
  message: string;
  stack?: string | null;
  componentStack?: string | null;
  url?: string;
  userAgent?: string;
  timestamp: string;
  extra?: any;
}

/**
 * Minimal error reporter used by the client ErrorBoundary.
 */
export async function reportError(error: Error | null, info?: any) {
  if (!error && !info) return;

  const payload: ErrorPayload = {
    message: error ? error.message : 'Unknown error',
    stack: error ? error.stack ?? null : null,
    componentStack: info?.componentStack ?? null,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
    extra: info,
  };

 
  try {
    /* eslint-disable no-console */
    if (typeof console !== 'undefined') {
    
      const title = `ErrorReporter — ${payload.message} ${payload.url ? `@ ${payload.url}` : ''}`;
      if (console.groupCollapsed) console.groupCollapsed(title);

      console.error('Message:', payload.message);
      if (payload.stack) console.error('Stack:', payload.stack);
      if (payload.componentStack) console.error('Component Stack:', payload.componentStack);

      const meta = {
        url: payload.url,
        userAgent: payload.userAgent,
        timestamp: payload.timestamp,
      };
      console.info('Context:', meta);

      if (payload.extra) console.debug('Extra:', payload.extra);

      if (console.groupEnd) console.groupEnd();
    }
    /* eslint-enable no-console */
  } catch (_) {
    // ignore logging failures — don't break app flow
  }

  const reportUrl = process.env.NEXT_PUBLIC_ERROR_REPORT_URL || (typeof window !== 'undefined' ? (window as any).__ERROR_REPORT_URL : undefined);

  if (!reportUrl) return;

  try {
    const body = JSON.stringify(payload);
    if (typeof fetch === 'undefined') return;
    return fetch(reportUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('Error reporter failed to send payload', err);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Error reporter error', err);
  }
}

export default reportError;
