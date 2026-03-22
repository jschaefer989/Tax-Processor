import { useEffect } from "react";
import type { TaxBehavior } from "../DataModel/TaxBehavior";

export function useRefreshDbConnection(
  showStartPage: boolean,
  noDbConnection: boolean,
  taxBehavior: TaxBehavior,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) {
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

    if (!noDbConnection) {
      return () => {
        isCancelled = true;
      };
    }

    const intervalId = window.setInterval(() => {
      void refreshDbConnection();
    }, 10000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [showStartPage, noDbConnection, taxBehavior, enabled]);
}
