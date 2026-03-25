import { useEffect, useMemo, useState } from "react";
import ServerBehavior from "../api/ServerBehavior";

type UseServerBehaviorResult = {
  serverBehavior: ServerBehavior;
  isServerDown: boolean;
};

export default function useServerBehavior(): UseServerBehaviorResult {

  const [isServerDown, setIsServerDown] = useState(false);

  const serverBehavior = useMemo(() => {
    return new ServerBehavior(setIsServerDown);
  }, []);

  useEffect(() => {
    let disposed = false;

    const checkServerHealth = async () => {
      try {
        const response = await serverBehavior.serverApiFetch("/api/health");
        if (!disposed) {
          setIsServerDown(!response.ok);
        }
      } catch {
        if (!disposed) {
          setIsServerDown(true);
        }
      }
    };

    void checkServerHealth();

    return () => {
      disposed = true;
    };
  }, []);

  return { serverBehavior, isServerDown };
}
