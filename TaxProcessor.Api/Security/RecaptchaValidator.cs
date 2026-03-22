using System.Text.Json;

namespace TaxProcessor.Api.Security;

public class RecaptchaValidator(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<RecaptchaValidator> logger
)
{
    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
    private readonly IConfiguration _configuration = configuration;
    private readonly ILogger<RecaptchaValidator> _logger = logger;

    public async Task<bool> IsValidAsync(string token)
    {
        var secret = _configuration["RECAPTCHA_SECRET_KEY"];
        if (string.IsNullOrWhiteSpace(secret))
        {
            _logger.LogWarning("RECAPTCHA_SECRET_KEY is not configured.");
            return false;
        }

        if (string.IsNullOrWhiteSpace(token))
        {
            _logger.LogWarning("Captcha token is missing or empty.");
            return false;
        }

        var client = _httpClientFactory.CreateClient();
        var content = new FormUrlEncodedContent(
        [
            new KeyValuePair<string, string>("secret", secret),
            new KeyValuePair<string, string>("response", token),
        ]);

        using var response = await client.PostAsync("https://www.google.com/recaptcha/api/siteverify", content);
        if (!response.IsSuccessStatusCode)
        {
            return false;
        }

        var payload = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(payload);
        var root = document.RootElement;

        if (!root.TryGetProperty("success", out var successProp) || !successProp.GetBoolean())
        {
            var errors = root.TryGetProperty("error-codes", out var errProp) ? errProp.ToString() : "none";
            _logger.LogWarning("reCAPTCHA siteverify returned success=false. Errors: {Errors}", errors);
            return false;
        }

        // v3 returns a score (0.0–1.0); require at least 0.5
        if (root.TryGetProperty("score", out var scoreProp))
        {
            var score = scoreProp.GetDouble();
            if (score < 0.5)
            {
                _logger.LogWarning("reCAPTCHA score too low: {Score}", score);
                return false;
            }
        }

        return true;
    }
}
