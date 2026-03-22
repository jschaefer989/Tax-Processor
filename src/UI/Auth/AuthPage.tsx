import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

// TODO: clean up this file

type AuthMode = "login" | "register" | "forgot" | "reset";

type Props = {
  onAuthenticated: () => void;
};

type GrecaptchaV3 = {
  ready: (callback: () => void) => void;
  execute: (sitekey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: GrecaptchaV3;
  }
}

const captchaSiteKey = (import.meta as ImportMeta & {
  env: Record<string, string | undefined>;
}).env.VITE_RECAPTCHA_SITE_KEY;

const getInitialMode = (): AuthMode => {
  const params = new URLSearchParams(window.location.search);
  return params.get("resetToken") ? "reset" : "login";
};

export default function AuthPage({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<AuthMode>(() => getInitialMode());
  const [email, setEmail] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("email") ?? "";
  });
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);

  const resetToken = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("resetToken") ?? "";
  }, []);

  useEffect(() => {
    if (!captchaSiteKey) return;
    const scriptId = "google-recaptcha-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.google.com/recaptcha/api.js?render=${captchaSiteKey}`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const executeRecaptcha = (action: string): Promise<string> => {
    if (!captchaSiteKey) {
      return Promise.reject(new Error("Captcha is not configured. Set VITE_RECAPTCHA_SITE_KEY."));
    }
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        reject(new Error("reCAPTCHA not loaded yet. Please try again."));
        return;
      }
      window.grecaptcha.ready(() => {
        window.grecaptcha!.execute(captchaSiteKey, { action }).then(resolve).catch(reject);
      });
    });
  };

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);

    try {
      setIsBusy(true);
      const captchaToken = await executeRecaptcha("login");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message ?? "Unable to log in.");
      }

      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in.");
    } finally {
      setIsBusy(false);
    }
  };

  const onRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    try {
      setIsBusy(true);
      const captchaToken = await executeRecaptcha("register");
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message ?? "Unable to create account.");
      }

      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setIsBusy(false);
    }
  };

  const onForgotPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);

    try {
      setIsBusy(true);
      const captchaToken = await executeRecaptcha("forgot_password");
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, captchaToken }),
      });

      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message ?? "Unable to request password reset.");
      }

      setMessage(data.message ?? "If an account exists, a reset link was sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to request password reset.");
    } finally {
      setIsBusy(false);
    }
  };

  const onResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);

    if (!resetToken) {
      setError("Missing reset token.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    try {
      setIsBusy(true);
      const captchaToken = await executeRecaptcha("reset_password");
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token: resetToken,
          newPassword,
          captchaToken,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message ?? "Unable to reset password.");
      }

      setMessage("Password updated. You can now log in.");
      setMode("login");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      window.history.replaceState({}, "", "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Tax Clarity</h1>
        <p className="auth-subtitle">Sign in to continue filing your taxes.</p>

        <div className="auth-tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Login
          </button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
            Register
          </button>
          <button type="button" className={mode === "forgot" ? "active" : ""} onClick={() => setMode("forgot")}>
            Forgot password
          </button>
        </div>

        {(mode === "login" || mode === "register" || mode === "forgot") && (
          <form onSubmit={mode === "login" ? onLogin : mode === "register" ? onRegister : onForgotPassword} className="auth-form">
            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            {(mode === "login" || mode === "register") && (
              <label>
                Password
                <input
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
            )}

            {mode === "register" && (
              <label>
                Confirm password
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>
            )}

            <button type="submit" disabled={isBusy}>
              {isBusy ? "Please wait..." : mode === "login" ? "Login" : mode === "register" ? "Create account" : "Send reset email"}
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={onResetPassword} className="auth-form">
            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label>
              New password
              <input
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>

            <label>
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>

            <button type="submit" disabled={isBusy}>
              {isBusy ? "Please wait..." : "Reset password"}
            </button>
          </form>
        )}

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-message">{message}</p>}

        <p className="auth-recaptcha-notice">
          Protected by reCAPTCHA &mdash;{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Privacy</a>
          {" & "}
          <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Terms</a>
        </p>
      </div>
    </div>
  );
}
