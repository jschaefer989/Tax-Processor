import { useCallback } from "react";
import type AuthBehavior from "../../api/AuthBehavior";
import type { ExecuteRecaptchaFunction } from "../../hooks/useRecatcha";

type ForgotPasswordTabProps = {
  readonly authBehavior: AuthBehavior;
  readonly email: string;
  readonly isBusy: boolean;
  readonly password: string;
  readonly onAuthenticated: () => void;
  readonly executeRecaptcha: ExecuteRecaptchaFunction;
};

export default function ForgotPasswordTab(props: ForgotPasswordTabProps) {
  const {
    authBehavior,
    email,
    isBusy,
    password,
    onAuthenticated,
    executeRecaptcha,
  } = props;

  const onLogin = useCallback(
    async (event: React.SubmitEvent) => {
      event.preventDefault();
      authBehavior.login(email, password, executeRecaptcha, onAuthenticated);
    },
    [email, password, executeRecaptcha, onAuthenticated],
  );

  return (
    <form onSubmit={onLogin} className="auth-form">
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => authBehavior.setPassword(event.target.value)}
        />
      </label>

      <button type="submit" disabled={isBusy}>
        {isBusy ? "Please wait..." : "Login"}
      </button>
    </form>
  );
}
