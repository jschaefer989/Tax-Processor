import { useState, useEffect } from "react";
import type ServerBehavior from "../api/ServerBehavior";

type UseAuthenticationResult = {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

type UseAuthenticationProps = {
  readonly serverBehavior: ServerBehavior;
};

export default function useAuthentication(  
  props: UseAuthenticationProps,
): UseAuthenticationResult {
  const { serverBehavior } = props;

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let disposed = false;

    const checkAuth = async () => {
      try {
        const response = await serverBehavior.serverApiFetch("/api/auth/me");
        if (!disposed) {
          setIsAuthenticated(response.ok);
        }
      } catch {
        if (!disposed) {
          setIsAuthenticated(false);
        }
      } finally {
        if (!disposed) {
          setIsAuthenticated?.(false);
        }
      }
    };

    void checkAuth();

    return () => {
      disposed = true;
    };
  }, []);

  return { isAuthenticated, setIsAuthenticated };
}
