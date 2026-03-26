import type { AuthMode } from "./AuthPage";

type AuthSubtitleProps = {authMode: AuthMode};

export default function AuthSubtitle(props: AuthSubtitleProps) {
    const { authMode } = props;

    let subtitle = "";
    switch (authMode) {
        case "login":
            subtitle = "Welcome back! Please log in.";
            break;
        case "register":
            subtitle = "Create a new account.";
            break;
        case "forgot":
            subtitle = "Reset your password.";
            break;
        case "reset":
            subtitle = "Set a new password.";
            break;
        case "otp":
            subtitle = "Enter the 6-digit code from your email.";
            break;
    }

    return <p className="subtitle">{subtitle}</p>;
}