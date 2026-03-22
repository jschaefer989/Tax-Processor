import type { AuthMode } from "../UI/Auth/AuthPage";

export default class AuthBehavior {
    setMode: React.Dispatch<React.SetStateAction<AuthMode>>;
    setEmail: React.Dispatch<React.SetStateAction<string>>
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    setNewPassword: React.Dispatch<React.SetStateAction<string>>;
    setConfirmPassword: React.Dispatch<React.SetStateAction<string>>
    setError: React.Dispatch<React.SetStateAction<string | undefined>>;
    setMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
    setIsBusy: React.Dispatch<React.SetStateAction<boolean>>;
    resetToken: string | undefined;

    constructor(
        setMode: React.Dispatch<React.SetStateAction<AuthMode>>,
        setEmail: React.Dispatch<React.SetStateAction<string>>,
        setPassword: React.Dispatch<React.SetStateAction<string>>,
        setNewPassword: React.Dispatch<React.SetStateAction<string>>,
        setConfirmPassword: React.Dispatch<React.SetStateAction<string>>,
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
        this.setError = setError;
        this.setMessage = setMessage;
        this.setIsBusy = setIsBusy;
        this.resetToken = resetToken;

    }
}