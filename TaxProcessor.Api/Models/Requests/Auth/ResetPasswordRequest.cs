namespace TaxProcessor.Api.Models.Requests.Auth;

public class ResetPasswordRequest
{
    public required string Email { get; set; }

    public required string Token { get; set; }

    public required string NewPassword { get; set; }

    public required string CaptchaToken { get; set; }
}
