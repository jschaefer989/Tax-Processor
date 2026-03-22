import { useState, useEffect } from "react";

type UseAuthenticationResult = {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

type UseAuthenticationProps = {
  readonly setIsAuthenticated?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function useAuthentication(
  props?: UseAuthenticationProps,
): UseAuthenticationResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let disposed = false;

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!disposed) {
          setIsAuthenticated(response.ok);
        }
      } catch {
        if (!disposed) {
          setIsAuthenticated(false);
        }
      } finally {
        if (!disposed) {
          props?.setIsAuthenticated?.(false);
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
