import { useEffect } from "react";
import type { TaxBehavior } from "../DataModel/TaxBehavior";

export function useRefreshDbConnection(
  showStartPage: boolean,
  noDbConnection: boolean,
  taxBehavior: TaxBehavior,
  setNoDbConnection: React.Dispatch<React.SetStateAction<boolean>>,
) {
  useEffect(() => {
    if (showStartPage) {
      return;
    }

    let isCancelled = false;

    const refreshDbConnection = async () => {
      const connected = await taxBehavior.getDatabaseConnectionStatus();
      if (!isCancelled) {
        setNoDbConnection(!connected);
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
  }, [showStartPage, noDbConnection, taxBehavior]);
}
