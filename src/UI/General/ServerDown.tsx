import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 3000;

export default function ServerDown() {
  const [isServerBack, setIsServerBack] = useState(false);

  useEffect(() => {
    let disposed = false;
    let pollTimer: number | undefined;

    const pollServerHealth = async () => {
      try {
        const response = await fetch("/api/health", { method: "GET" });
        if (!disposed && response.ok) {
          setIsServerBack(true);
        }
      } catch {
        // Server still down, will retry on next poll
      }

      if (!disposed) {
        pollTimer = setTimeout(pollServerHealth, POLL_INTERVAL_MS);
      }
    };

    pollTimer = setTimeout(pollServerHealth, POLL_INTERVAL_MS);

    return () => {
      disposed = true;
      if (pollTimer) {
        clearTimeout(pollTimer);
      }
    };
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="app app-server-down">
      <div className="server-down-content">
        <h1>Server is down.</h1>
        {isServerBack ? (
          <>
            <p>The server is back online.</p>
            <button onClick={handleReload} className="btn-primary">
              Reload page
            </button>
          </>
        ) : (
          <p>Waiting for server to come back online...</p>
        )}
      </div>
    </div>
  );
}
