namespace TaxProcessor.Api.Models.Requests.Auth;

public class AuthLoginRequest
{
    public required string Email { get; set; }

    public required string Password { get; set; }

    public required string CaptchaToken { get; set; }
}
