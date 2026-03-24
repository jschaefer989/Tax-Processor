import { useCallback } from "react";
import type { TaxBehavior } from "../../api/TaxBehavior";

type LogoutButtonProps = {
  readonly taxBehavior: TaxBehavior;
};

export default function LogoutButton(props: LogoutButtonProps) {
  const { taxBehavior } = props;

  const handleLogout = useCallback(async () => {
    await taxBehavior.serverBehavior.serverApiFetch("/api/auth/logout", {
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
