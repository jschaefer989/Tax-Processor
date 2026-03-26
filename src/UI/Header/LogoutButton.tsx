import { useCallback } from "react";
import type { TaxBehavior } from "../../api/TaxBehavior";

type LogoutButtonProps = {
  readonly taxBehavior: TaxBehavior;
  readonly isLoading: boolean;
};

export default function LogoutButton(props: LogoutButtonProps) {
  const { taxBehavior, isLoading } = props;

  const handleLogout = useCallback(async () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout? Any unsaved progress will be lost.",
    );
    if (confirmed) {
      await taxBehavior.serverBehavior.serverApiFetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.reload();
    }
  }, [taxBehavior]);

  return (
    <button
      className="ghost"
      onClick={handleLogout}
      disabled={isLoading}
      title={
        isLoading
          ? "Server is busy. Please wait..."
          : "Logout and return to the login page."
      }
    >
      Logout
    </button>
  );
}
