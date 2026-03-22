namespace TaxProcessor.Api.Models.Requests.Auth;

public class ForgotPasswordRequest
{
    public required string Email { get; set; }

    public required string CaptchaToken { get; set; }
}
