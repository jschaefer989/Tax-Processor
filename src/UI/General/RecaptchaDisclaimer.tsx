export default function RecaptchaDisclaimer() {
  return (
    <p className="auth-recaptcha-notice">
      Protected by reCAPTCHA &mdash;{" "}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noreferrer"
      >
        Privacy
      </a>
      {" & "}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noreferrer"
      >
        Terms
      </a>
    </p>
  );
}
