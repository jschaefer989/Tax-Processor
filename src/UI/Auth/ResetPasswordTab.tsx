import type AuthBehavior from "../../DataModel/AuthBehavior";
import type { ExecuteRecaptchaFunction } from "../../hooks/useRecatcha";

type ResetPasswordTabProps = {
  readonly authBehavior: AuthBehavior;
  readonly email: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
  readonly isBusy: boolean;
  readonly executeRecaptcha: ExecuteRecaptchaFunction;
};

export default function ResetPasswordTab(props: ResetPasswordTabProps) {
  const {
    authBehavior,
    email,
    newPassword,
    confirmPassword,
    isBusy,
    executeRecaptcha,
  } = props;

  const onResetPassword = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    authBehavior.setError(undefined);
    authBehavior.setMessage(undefined);

    if (!authBehavior.resetToken) {
      authBehavior.setError("Missing reset token.");
      return;
    }

    if (newPassword.length < 8) {
      authBehavior.setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      authBehavior.setError("Password confirmation does not match.");
      return;
    }

    try {
      authBehavior.setIsBusy(true);
      const captchaToken = await executeRecaptcha("reset_password");
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token: authBehavior.resetToken,
          newPassword,
          captchaToken,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!response.ok) {
        throw new Error(data.message ?? "Unable to reset password.");
      }

      authBehavior.setMessage("Password updated. You can now log in.");
      authBehavior.setMode("login");
      authBehavior.setPassword("");
      authBehavior.setNewPassword("");
      authBehavior.setConfirmPassword("");
      window.history.replaceState({}, "", "/");
    } catch (err) {
      authBehavior.setError(
        err instanceof Error ? err.message : "Unable to reset password.",
      );
    } finally {
      authBehavior.setIsBusy(false);
    }
  };

  return (
    <form onSubmit={onResetPassword} className="auth-form">
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
        New password
        <input
          type="password"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(event) => authBehavior.setNewPassword(event.target.value)}
        />
      </label>

      <label>
        Confirm new password
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
        {isBusy ? "Please wait..." : "Reset password"}
      </button>
    </form>
  );
}
