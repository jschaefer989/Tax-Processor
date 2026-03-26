import { useCallback } from "react";
import type AuthBehavior from "../../api/AuthBehavior";
import type { ExecuteRecaptchaFunction } from "../../hooks/useRecatcha";

type OtpTabProps = {
  readonly authBehavior: AuthBehavior;
  readonly email: string;
  readonly otpCode: string;
  readonly otpChallengeToken: string | undefined;
  readonly isBusy: boolean;
  readonly onAuthenticated: () => void;
  readonly executeRecaptcha: ExecuteRecaptchaFunction;
};

export default function OtpTab(props: OtpTabProps) {
  const {
    authBehavior,
    email,
    otpCode,
    otpChallengeToken,
    isBusy,
    onAuthenticated,
    executeRecaptcha,
  } = props;

  const onVerifyCode = useCallback(
    async (event: React.SubmitEvent) => {
      event.preventDefault();
      await authBehavior.verifyLoginOtp(
        email,
        otpCode,
        executeRecaptcha,
        onAuthenticated,
        otpChallengeToken,
      );
    },
    [
      authBehavior,
      email,
      otpCode,
      executeRecaptcha,
      onAuthenticated,
      otpChallengeToken,
    ],
  );

  return (
    <form onSubmit={onVerifyCode} className="auth-form">
      <label>
        Verification code
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          value={otpCode}
          onChange={(event) =>
            authBehavior.setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
        />
      </label>

      <button type="submit" disabled={isBusy}>
        {isBusy ? "Please wait..." : "Verify code"}
      </button>

      <button
        type="button"
        className="auth-secondary-button"
        disabled={isBusy}
        onClick={() => authBehavior.backToLoginFromOtp()}
      >
        Back to login
      </button>
    </form>
  );
}
