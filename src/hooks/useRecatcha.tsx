import { useEffect } from "react";

type GrecaptchaV3 = {
  ready: (callback: () => void) => void;
  execute: (sitekey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: GrecaptchaV3;
  }
}

const captchaSiteKey = (
  import.meta as ImportMeta & {
    env: Record<string, string | undefined>;
  }
).env.VITE_RECAPTCHA_SITE_KEY;

export type UseRecaptchaResult = {
  executeRecaptcha: ExecuteRecaptchaFunction;
}

export type ExecuteRecaptchaFunction = (action: string) => Promise<string>;

export default function useRecaptcha(): UseRecaptchaResult {

  useEffect(() => {
    if (!captchaSiteKey) {
      return;
    }
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
      return Promise.reject(
        new Error("Captcha is not configured. Set VITE_RECAPTCHA_SITE_KEY."),
      );
    }
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        reject(new Error("reCAPTCHA not loaded yet. Please try again."));
        return;
      }
      window.grecaptcha.ready(() => {
        window
          .grecaptcha!.execute(captchaSiteKey, { action })
          .then(resolve)
          .catch(reject);
      });
    });
  };

  return { executeRecaptcha };
}