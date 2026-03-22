import { useCallback } from "react";

export default function LogoutButton() {
  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  }, []);

  return (
    <button className="logout-button" onClick={handleLogout}>
      Logout
    </button>
  );
}
