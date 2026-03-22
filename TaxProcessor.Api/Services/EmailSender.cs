using System.Net;
using System.Net.Mail;

namespace TaxProcessor.Api.Services;

public class EmailSender(IConfiguration configuration, ILogger<EmailSender> logger)
{
    private readonly IConfiguration _configuration = configuration;
    private readonly ILogger<EmailSender> _logger = logger;

    public async Task SendPasswordResetEmailAsync(string recipientEmail, string resetLink)
    {
        var host = _configuration["SMTP_HOST"];
        var fromEmail = _configuration["SMTP_FROM_EMAIL"];

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(fromEmail))
        {
            _logger.LogWarning(
                "SMTP configuration is missing (Host: {HasHost}, FromEmail: {HasFromEmail}). Password reset email was not sent.",
                !string.IsNullOrWhiteSpace(host),
                !string.IsNullOrWhiteSpace(fromEmail)
            );
            return;
        }

        var portValue = _configuration["SMTP_PORT"];
        var enableSslValue = _configuration["SMTP_ENABLE_SSL"];
        var username = _configuration["SMTP_USERNAME"];
        var password = _configuration["SMTP_PASSWORD"];
        var messageStream = _configuration["SMTP_MESSAGE_STREAM"];

        var port = 587;
        if (!string.IsNullOrWhiteSpace(portValue) && int.TryParse(portValue, out var parsedPort))
        {
            port = parsedPort;
        }

        var enableSsl = true;
        if (!string.IsNullOrWhiteSpace(enableSslValue) && bool.TryParse(enableSslValue, out var parsedSsl))
        {
            enableSsl = parsedSsl;
        }

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = enableSsl,
        };

        if (!string.IsNullOrWhiteSpace(username))
        {
            client.Credentials = new NetworkCredential(username, password ?? string.Empty);
        }

        using var message = new MailMessage(fromEmail, recipientEmail)
        {
            Subject = "Tax Processor password reset",
            Body = "Use this link to reset your password: " + resetLink,
            IsBodyHtml = false,
        };

        if (host.Contains("postmarkapp.com", StringComparison.OrdinalIgnoreCase))
        {
            message.Headers.Add(
                "X-PM-Message-Stream",
                string.IsNullOrWhiteSpace(messageStream) ? "outbound" : messageStream
            );
        }

        try
        {
            await client.SendMailAsync(message);
            _logger.LogInformation("Password reset email sent to {RecipientEmail}.", recipientEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email.");
        }
    }
}
