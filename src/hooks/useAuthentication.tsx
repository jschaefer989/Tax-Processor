import { useState, useEffect } from "react";

type UseAuthenticationResult = {
  isAuthenticated: boolean;
  authLoading: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function useAuthentication(): UseAuthenticationResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

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
          setAuthLoading(false);
        }
      }
    };

    void checkAuth();

    return () => {
      disposed = true;
    };
  }, []);

  return { isAuthenticated, authLoading, setIsAuthenticated };
}
