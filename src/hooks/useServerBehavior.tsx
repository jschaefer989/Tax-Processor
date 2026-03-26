import { useLayoutEffect, useMemo, useState } from "react";
import ServerBehavior from "../api/ServerBehavior";

type UseServerBehaviorResult = {
  readonly serverBehavior: ServerBehavior;
  readonly isServerDown: boolean;
  readonly isInitialized: boolean;
};

export default function useServerBehavior(): UseServerBehaviorResult {

  const [isServerDown, setIsServerDown] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const serverBehavior = useMemo(() => {
    return new ServerBehavior(setIsServerDown);
  }, []);

  useLayoutEffect(() => {
    let isDisposed = false;

    const checkServerHealth = async () => {
      try {
        const response = await serverBehavior.serverApiFetch("/api/health");
        if (!isDisposed) {
          setIsServerDown(!response.ok);
          setIsInitialized(true);
        }
      } catch {
        if (!isDisposed) {
          setIsServerDown(true);
          setIsInitialized(true);
        }
      }
    };

    void checkServerHealth();

    return () => {
      isDisposed = true;
    };
  }, []);

  return { serverBehavior, isServerDown, isInitialized };
}
