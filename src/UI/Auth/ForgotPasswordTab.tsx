import { useCallback } from "react";
import type AuthBehavior from "../../DataModel/AuthBehavior";
import type { ExecuteRecaptchaFunction } from "../../hooks/useRecatcha";

type ForgotPasswordTabProps = {
  readonly authBehavior: AuthBehavior;
  readonly email: string;
  readonly isBusy: boolean;
  readonly executeRecaptcha: ExecuteRecaptchaFunction;
};

export default function ForgotPasswordTab(props: ForgotPasswordTabProps) {
  const { authBehavior, email, isBusy, executeRecaptcha } = props;

  const onForgotPassword = useCallback(
    async (event: React.SubmitEvent) => {
      event.preventDefault();
      authBehavior.setError(undefined);
      authBehavior.setMessage(undefined);

      try {
        authBehavior.setIsBusy(true);
        const captchaToken = await executeRecaptcha("forgot_password");
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, captchaToken }),
        });

        const data = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        if (!response.ok) {
          throw new Error(data.message ?? "Unable to request password reset.");
        }

        authBehavior.setMessage(
          data.message ?? "If an account exists, a reset link was sent.",
        );
      } catch (err) {
        authBehavior.setError(
          err instanceof Error
            ? err.message
            : "Unable to request password reset.",
        );
      } finally {
        authBehavior.setIsBusy(false);
      }
    },
    [email, executeRecaptcha],
  );

  return (
    <form onSubmit={onForgotPassword} className="auth-form">
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

      <button type="submit" disabled={isBusy}>
        {isBusy ? "Please wait..." : "Send reset email"}
      </button>
    </form>
  );
}
