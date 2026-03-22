import { useEffect } from "react";
import type { TaxBehavior } from "../DataModel/TaxBehavior";

export function useRefreshDbConnection(
  showStartPage: boolean,
  noDbConnection: boolean,
  taxBehavior: TaxBehavior,
  enabled: boolean,
) {
  useEffect(() => {
    // Only poll while authenticated users are on the start page and
    // currently marked as disconnected.
    if (!enabled || !showStartPage || !noDbConnection) {
      return;
    }

    let isCancelled = false;

    const refreshDbConnection = async () => {
      const connected = await taxBehavior.getDatabaseConnectionStatus();
      if (!isCancelled) {
        taxBehavior.state.setNoDbConnection(!connected);
      }
    };

    void refreshDbConnection();

    const intervalId = window.setInterval(() => {
      void refreshDbConnection();
    }, 10000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [showStartPage, noDbConnection, taxBehavior, enabled]);
}
