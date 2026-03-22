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
    authBehavior.resetPassword(
      newPassword,
      confirmPassword,
      executeRecaptcha,
      email,
    );
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
