namespace TaxProcessor.Api.Models.Requests.Auth;

public class VerifyLoginOtpRequest
{
    public required string Email { get; set; }

    public required string OtpCode { get; set; }

    public required string ChallengeToken { get; set; }

    public required string CaptchaToken { get; set; }
}