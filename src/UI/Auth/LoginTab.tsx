import { useCallback } from "react";
import type AuthBehavior from "../../DataModel/AuthBehavior";
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
      authBehavior.setError(undefined);
      authBehavior.setMessage(undefined);

      try {
        authBehavior.setIsBusy(true);
        const captchaToken = await executeRecaptcha("login");
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, captchaToken }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as {
            message?: string;
          };
          throw new Error(data.message ?? "Unable to log in.");
        }

        onAuthenticated();
      } catch (err) {
        authBehavior.setError(
          err instanceof Error ? err.message : "Unable to log in.",
        );
      } finally {
        authBehavior.setIsBusy(false);
      }
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
