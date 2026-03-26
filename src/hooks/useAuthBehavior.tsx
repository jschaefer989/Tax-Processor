import { useState, useMemo } from "react";
import type { AuthMode } from "../UI/Auth/AuthPage";
import AuthBehavior from "../api/AuthBehavior";
import type ServerBehavior from "../api/ServerBehavior";

type UseAuthBehaviorResult = {
  mode: AuthMode;
  email: string;
  password: string;
  newPassword: string;
  confirmPassword: string;
  otpCode: string;
  otpChallengeToken: string | undefined;
  error: string | undefined;
  message: string | undefined;
  authBehavior: AuthBehavior;
  resetToken: string | undefined;
};

type UseAuthBehaviorProps = {
  readonly serverBehavior: ServerBehavior;
  readonly setIsBusy: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function useAuthBehavior(
  props: UseAuthBehaviorProps,
): UseAuthBehaviorResult {
  const { serverBehavior, setIsBusy } = props;

  const [mode, setMode] = useState<AuthMode>(() => getInitialMode());
  const [email, setEmail] = useState(() => getInitialEmail());
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpChallengeToken, setOtpChallengeToken] = useState<string | undefined>(
    undefined,
  );
  const [error, setError] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const resetToken = useMemo(() => getResetToken(), []);

  const authBehavior = useMemo(
    () =>
      new AuthBehavior(
        serverBehavior,
        setMode,
        setEmail,
        setPassword,
        setNewPassword,
        setConfirmPassword,
        setOtpCode,
        setOtpChallengeToken,
        setError,
        setMessage,
        setIsBusy,
        resetToken,
      ),
    [resetToken, serverBehavior],
  );

  return {
    mode,
    email,
    password,
    newPassword,
    confirmPassword,
    otpCode,
    otpChallengeToken,
    error,
    message,
    authBehavior,
    resetToken,
  };
}

function getInitialMode(): AuthMode {
  const params = new URLSearchParams(window.location.search);
  return params.get("resetToken") ? "reset" : "login";
}

function getInitialEmail(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("email") ?? "";
}

function getResetToken(): string | undefined {
  const params = new URLSearchParams(window.location.search);
  return params.get("resetToken") ?? undefined;
}
