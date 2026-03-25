import useAuthBehavior from "../../hooks/useAuthBehavior";
import useRecaptcha from "../../hooks/useRecatcha";
import RecaptchaDisclaimer from "../General/RecaptchaDisclaimer";
import StartTitle from "../StartPage/StartTitle";
import AuthSubtitle from "./AuthSubtitle";
import LoginTab from "./LoginTab";
import ResetPasswordTab from "./ResetPasswordTab";
import AuthTabs from "./AuthTabs";
import ForgotPasswordTab from "./ForgotPasswordTab";
import RegisterTab from "./RegisterTab";
import type ServerBehavior from "../../api/ServerBehavior";
import.meta as ImportMeta;

export type AuthMode = "login" | "register" | "forgot" | "reset";

type AuthPageProps = {
  readonly serverBehavior: ServerBehavior;
  readonly onAuthenticated: () => void;
  readonly isBusy: boolean;
  readonly setIsBusy: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AuthPage(props: AuthPageProps) {
  const { serverBehavior, onAuthenticated, isBusy, setIsBusy } = props;

  const { executeRecaptcha } = useRecaptcha();

  const {
    mode,
    email,
    password,
    newPassword,
    confirmPassword,
    error,
    message,
    authBehavior,
  } = useAuthBehavior({ serverBehavior, setIsBusy });

  const tab = () => {
    switch (mode) {
      case "login":
        return (
          <LoginTab
            authBehavior={authBehavior}
            email={email}
            password={password}
            isBusy={isBusy}
            onAuthenticated={onAuthenticated}
            executeRecaptcha={executeRecaptcha}
          />
        );
      case "register":
        return (
          <RegisterTab
            authBehavior={authBehavior}
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            isBusy={isBusy}
            onAuthenticated={onAuthenticated}
            executeRecaptcha={executeRecaptcha}
          />
        );
      case "forgot":
        return (
          <ForgotPasswordTab
            authBehavior={authBehavior}
            email={email}
            isBusy={isBusy}
            executeRecaptcha={executeRecaptcha}
          />
        );
      case "reset":
        return (
          <ResetPasswordTab
            authBehavior={authBehavior}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            isBusy={isBusy}
            email={email}
            executeRecaptcha={executeRecaptcha}
          />
        );
    }
  };

  return (
    <StartTitle>
      <AuthSubtitle authMode={mode} />
      <div className="auth-container">
        <AuthTabs authBehavior={authBehavior} mode={mode} />
        {tab()}
        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-message">{message}</p>}
        <RecaptchaDisclaimer />
      </div>
    </StartTitle>
  );
}
