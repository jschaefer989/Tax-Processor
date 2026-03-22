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
      authBehavior.setError(undefined);
      authBehavior.setMessage(undefined);

      if (password.length < 8) {
        authBehavior.setError("Password must be at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        authBehavior.setError("Password confirmation does not match.");
        return;
      }

      try {
        authBehavior.setIsBusy(true);
        const captchaToken = await executeRecaptcha("register");
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, captchaToken }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as {
            message?: string;
          };
          throw new Error(data.message ?? "Unable to create account.");
        }

        onAuthenticated();
      } catch (err) {
        authBehavior.setError(
          err instanceof Error ? err.message : "Unable to create account.",
        );
      } finally {
        authBehavior.setIsBusy(false);
      }
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
