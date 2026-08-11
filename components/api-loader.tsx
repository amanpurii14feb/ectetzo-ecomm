"use client";

import { useEffect, useState } from "react";

const SHOW_DELAY_MS = 150;

export function ApiLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const originalFetch = window.fetch;
    let activeRequests = 0;
    let showTimer: ReturnType<typeof setTimeout> | undefined;

    function isApiRequest(input: RequestInfo | URL) {
      const value = input instanceof Request ? input.url : String(input);
      const url = new URL(value, window.location.origin);
      return url.origin === window.location.origin && url.pathname.startsWith("/api/");
    }

    function start() {
      activeRequests += 1;
      if (activeRequests === 1) {
        showTimer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
      }
    }

    function finish() {
      activeRequests = Math.max(0, activeRequests - 1);
      if (activeRequests === 0) {
        if (showTimer) clearTimeout(showTimer);
        showTimer = undefined;
        setVisible(false);
      }
    }

    const trackedFetch: typeof window.fetch = async (...args) => {
      if (!isApiRequest(args[0])) return originalFetch(...args);

      start();
      try {
        return await originalFetch(...args);
      } finally {
        finish();
      }
    };

    window.fetch = trackedFetch;
    return () => {
      if (window.fetch === trackedFetch) window.fetch = originalFetch;
      if (showTimer) clearTimeout(showTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="api-loader" role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      <span className="api-loader-bar" aria-hidden="true" />
    </div>
  );
}
