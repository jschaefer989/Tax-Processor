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
      authBehavior.forgotPassword(email, executeRecaptcha);
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
