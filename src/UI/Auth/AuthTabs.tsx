import type AuthBehavior from "../../api/AuthBehavior";
import type { AuthMode } from "./AuthPage";

type AuthTabsProps = {
  readonly authBehavior: AuthBehavior;
  mode: Omit<AuthMode | "reset", "reset">;
};

export default function AuthTabs(props: AuthTabsProps) {
  const { authBehavior, mode } = props;

  return (
    <div className="auth-tabs">
      <button
        type="button"
        className={mode === "login" ? "active" : ""}
        onClick={() => authBehavior.setMode("login")}
      >
        Login
      </button>
      <button
        type="button"
        className={mode === "register" ? "active" : ""}
        onClick={() => authBehavior.setMode("register")}
      >
        Register
      </button>
      <button
        type="button"
        className={mode === "forgot" ? "active" : ""}
        onClick={() => authBehavior.setMode("forgot")}
      >
        Forgot password
      </button>
    </div>
  );
}
