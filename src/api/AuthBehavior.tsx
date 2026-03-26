import type { AuthMode } from "../UI/Auth/AuthPage";
import ServerBehavior from "./ServerBehavior";

export default class AuthBehavior {
  setMode: React.Dispatch<React.SetStateAction<AuthMode>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  setOtpCode: React.Dispatch<React.SetStateAction<string>>;
  setOtpChallengeToken: React.Dispatch<React.SetStateAction<string | undefined>>;
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  setMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
  setIsBusy: React.Dispatch<React.SetStateAction<boolean>>;
  resetToken: string | undefined;
  serverBehavior: ServerBehavior;

  constructor(
    serverBehavior: ServerBehavior,
    setMode: React.Dispatch<React.SetStateAction<AuthMode>>,
    setEmail: React.Dispatch<React.SetStateAction<string>>,
    setPassword: React.Dispatch<React.SetStateAction<string>>,
    setNewPassword: React.Dispatch<React.SetStateAction<string>>,
    setConfirmPassword: React.Dispatch<React.SetStateAction<string>>,
    setOtpCode: React.Dispatch<React.SetStateAction<string>>,
    setOtpChallengeToken: React.Dispatch<React.SetStateAction<string | undefined>>,
    setError: React.Dispatch<React.SetStateAction<string | undefined>>,
    setMessage: React.Dispatch<React.SetStateAction<string | undefined>>,
    setIsBusy: React.Dispatch<React.SetStateAction<boolean>>,
    resetToken?: string,
  ) {
    this.setMode = setMode;
    this.setEmail = setEmail;
    this.setPassword = setPassword;
    this.setNewPassword = setNewPassword;
    this.setConfirmPassword = setConfirmPassword;
    this.setOtpCode = setOtpCode;
    this.setOtpChallengeToken = setOtpChallengeToken;
    this.setError = setError;
    this.setMessage = setMessage;
    this.setIsBusy = setIsBusy;
    this.resetToken = resetToken;
    this.serverBehavior = serverBehavior;
  }

  async login(
    email: string,
    password: string,
    executeRecaptcha: (action: string) => Promise<string>,
    onAuthenticated: () => void,
  ) {
    this.clearStatusMessages();

    try {
      this.setIsBusy(true);
      const captchaToken = await executeRecaptcha("login");
      const response = await this.serverBehavior.serverApiFetch("/api/auth/login", {
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

      const data = (await response.json().catch(() => ({}))) as {
        requiresOtp?: boolean;
        challengeToken?: string;
        message?: string;
      };

      if (data.requiresOtp) {
        if (!data.challengeToken) {
          throw new Error("Login challenge is invalid. Please try again.");
        }

        this.setPassword("");
        this.setOtpCode("");
        this.setOtpChallengeToken(data.challengeToken);
        this.setMessage(
          data.message ?? "A login verification code has been sent to your email.",
        );
        this.setMode("otp");
        return;
      }

      onAuthenticated();
    } catch (err) {
      this.setError(err instanceof Error ? err.message : "Unable to log in.");
    } finally {
      this.setIsBusy(false);
    }
  }

  async verifyLoginOtp(
    email: string,
    otpCode: string,
    executeRecaptcha: (action: string) => Promise<string>,
    onAuthenticated: () => void,
    otpChallengeToken?: string,
  ) {
    this.clearStatusMessages();

    if (!otpChallengeToken) {
      this.setError("Verification session expired. Please log in again.");
      this.setMode("login");
      return;
    }

    const normalizedOtpCode = otpCode.trim();
    if (!/^\d{6}$/.test(normalizedOtpCode)) {
      this.setError("Verification code must be 6 digits.");
      return;
    }

    try {
      this.setIsBusy(true);
      const captchaToken = await executeRecaptcha("verify_otp");
      const response = await this.serverBehavior.serverApiFetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otpCode: normalizedOtpCode,
          challengeToken: otpChallengeToken,
          captchaToken,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message ?? "Unable to verify code.");
      }

      this.setOtpCode("");
      this.setOtpChallengeToken(undefined);
      onAuthenticated();
    } catch (err) {
      this.setError(err instanceof Error ? err.message : "Unable to verify code.");
    } finally {
      this.setIsBusy(false);
    }
  }

  backToLoginFromOtp() {
    this.setOtpCode("");
    this.setOtpChallengeToken(undefined);
    this.setMode("login");
    this.clearStatusMessages();
  }

  async register(
    email: string,
    password: string,
    confirmPassword: string,
    executeRecaptcha: (action: string) => Promise<string>,
    onAuthenticated: () => void,
  ) {
    this.clearStatusMessages();

    if (password.length < 8) {
      this.setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      this.setError("Password confirmation does not match.");
      return;
    }

    try {
      this.setIsBusy(true);
      const captchaToken = await executeRecaptcha("register");
      const response = await this.serverBehavior.serverApiFetch("/api/auth/register", {
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
      this.setError(
        err instanceof Error ? err.message : "Unable to create account.",
      );
    } finally {
      this.setIsBusy(false);
    }
  }

  async forgotPassword(
    email: string,
    executeRecaptcha: (action: string) => Promise<string>,
  ) {
    this.clearStatusMessages();

    try {
      this.setIsBusy(true);
      const captchaToken = await executeRecaptcha("forgot_password");
      const response = await this.serverBehavior.serverApiFetch("/api/auth/forgot-password", {
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

      this.setMessage(
        data.message ?? "If an account exists, a reset link was sent.",
      );
    } catch (err) {
      this.setError(
        err instanceof Error
          ? err.message
          : "Unable to request password reset.",
      );
    } finally {
      this.setIsBusy(false);
    }
  }

  async resetPassword(
    newPassword: string,
    confirmPassword: string,
    executeRecaptcha: (action: string) => Promise<string>,
    email: string,
  ) {
    this.clearStatusMessages();

    if (!this.resetToken) {
      this.setError("Missing reset token.");
      return;
    }

    if (newPassword.length < 8) {
      this.setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      this.setError("Password confirmation does not match.");
      return;
    }

    try {
      this.setIsBusy(true);
      const captchaToken = await executeRecaptcha("reset_password");
      const response = await this.serverBehavior.serverApiFetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token: this.resetToken,
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

      this.setMessage("Password updated. You can now log in.");
      this.setMode("login");
      this.setPassword("");
      this.setNewPassword("");
      this.setConfirmPassword("");
      window.history.replaceState({}, "", "/");
    } catch (err) {
      this.setError(
        err instanceof Error ? err.message : "Unable to reset password.",
      );
    } finally {
      this.setIsBusy(false);
    }
  }

  clearStatusMessages() {
    this.setMessage(undefined);
    this.setError(undefined);
  }
}
