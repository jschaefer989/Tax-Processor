import { useCallback } from "react";
import type AuthBehavior from "../../DataModel/AuthBehavior";
import type { ExecuteRecaptchaFunction } from "../../hooks/useRecatcha";

type RegisterTabProps = {
  readonly authBehavior: AuthBehavior;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly isBusy: boolean;
  readonly onAuthenticated: () => void;
  readonly executeRecaptcha: ExecuteRecaptchaFunction;
};

export default function RegisterTab(props: RegisterTabProps) {
  const {
    authBehavior,
    email,
    password,
    confirmPassword,
    isBusy,
    onAuthenticated,
    executeRecaptcha,
  } = props;

  const onRegister = useCallback(
    async (event: React.SubmitEvent) => {
      event.preventDefault();
      authBehavior.register(
        email,
        password,
        confirmPassword,
        executeRecaptcha,
        onAuthenticated,
      );
    },
    [email, password, confirmPassword, executeRecaptcha, onAuthenticated],
  );

  return (
    <form onSubmit={onRegister} className="auth-form">
      <label>
        Email
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => authBehavior.setEmail(event.target.value)}
        />
      </label>

      <label>
        Password
        <input
          type="password"
          autoComplete={"new-password"}
          required
          value={password}
          onChange={(event) => authBehavior.setPassword(event.target.value)}
        />
      </label>

      <label>
        Confirm password
        <input
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) =>
            authBehavior.setConfirmPassword(event.target.value)
          }
        />
      </label>

      <button type="submit" disabled={isBusy}>
        {isBusy ? "Please wait..." : "Create account"}
      </button>
    </form>
  );
}
