import type AuthBehavior from "../../api/AuthBehavior";
import type { AuthMode } from "./AuthPage";

type AuthTabsProps = {
  readonly authBehavior: AuthBehavior;
  mode: Omit<AuthMode | "reset", "reset">;
};

export default function AuthTabs(props: AuthTabsProps) {
  const { authBehavior, mode } = props;

  const handleTabClick = (newMode: AuthMode) => {
    if (newMode === "reset") {
      console.log("Reset mode is not selectable from tabs.");
      return;
    }

    authBehavior.clearStatusMessages();
    authBehavior.setMode(newMode);
  }

  return (
    <div className="auth-tabs">
      <button
        type="button"
        className={mode === "login" ? "active" : ""}
        onClick={() => handleTabClick("login")}
      >
        Login
      </button>
      <button
        type="button"
        className={mode === "register" ? "active" : ""}
        onClick={() => handleTabClick("register")}
      >
        Register
      </button>
      <button
        type="button"
        className={mode === "forgot" ? "active" : ""}
        onClick={() => handleTabClick("forgot")}
      >
        Forgot password
      </button>
    </div>
  );
}
