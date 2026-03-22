using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxProcessor.Api.Data;
using TaxProcessor.Api.Extensions;
using TaxProcessor.Api.Models.Requests.Auth;
using TaxProcessor.Api.Security;
using TaxProcessor.Api.Services;

namespace TaxProcessor.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    TaxDbContext db,
    PasswordHashingService passwordHashingService,
    RecaptchaValidator recaptchaValidator,
    EmailSender emailSender,
    IConfiguration configuration
) : ControllerBase
{
    private readonly TaxDbContext _db = db;
    private readonly PasswordHashingService _passwordHashingService = passwordHashingService;
    private readonly RecaptchaValidator _recaptchaValidator = recaptchaValidator;
    private readonly EmailSender _emailSender = emailSender;
    private readonly IConfiguration _configuration = configuration;

    [HttpGet("me")]
    public ActionResult GetCurrentProfile()
    {
        if (!(User?.Identity?.IsAuthenticated ?? false))
        {
            return Unauthorized(new { message = "Not authenticated." });
        }

        var profileId = User.GetProfileId();
        var email = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        return Ok(new { profileId, email });
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] AuthRegisterRequest request)
    {
        if (!await _recaptchaValidator.IsValidAsync(request.CaptchaToken))
        {
            return BadRequest(new { message = "Captcha verification failed." });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        if (!IsValidEmail(email))
        {
            return BadRequest(new { message = "Invalid email address." });
        }

        if (!IsValidPassword(request.Password))
        {
            return BadRequest(new { message = "Password must be at least 8 characters." });
        }

        var exists = await _db.Profiles.AnyAsync(profile => profile.Email == email);
        if (exists)
        {
            return Conflict(new { message = "An account with this email already exists." });
        }

        var now = DateTime.UtcNow;
        var (hash, salt) = _passwordHashingService.HashPassword(request.Password);

        var profile = new ProfileEntity
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = hash,
            PasswordSalt = salt,
            CreatedAtUtc = now,
            LastLoginAtUtc = now,
        };

        _db.Profiles.Add(profile);
        await _db.SaveChangesAsync();

        await SignInProfileAsync(profile);

        return Ok(new { profileId = profile.Id, email = profile.Email });
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] AuthLoginRequest request)
    {
        if (!await _recaptchaValidator.IsValidAsync(request.CaptchaToken))
        {
            return BadRequest(new { message = "Captcha verification failed." });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var profile = await _db.Profiles.FirstOrDefaultAsync(item => item.Email == email);
        if (profile is null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var validPassword = _passwordHashingService.VerifyPassword(
            request.Password,
            profile.PasswordHash,
            profile.PasswordSalt
        );

        if (!validPassword)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        profile.LastLoginAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await SignInProfileAsync(profile);

        return Ok(new { profileId = profile.Id, email = profile.Email });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok(new { message = "Logged out successfully." });
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (!await _recaptchaValidator.IsValidAsync(request.CaptchaToken))
        {
            return BadRequest(new { message = "Captcha verification failed." });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var profile = await _db.Profiles.FirstOrDefaultAsync(item => item.Email == email);

        if (profile is not null)
        {
            var token = CreateToken();
            profile.PasswordResetTokenHash = HashToken(token);
            profile.PasswordResetTokenExpiresAtUtc = DateTime.UtcNow.AddMinutes(30);
            await _db.SaveChangesAsync();

            var frontendBaseUrl = _configuration["FRONTEND_BASE_URL"];
            if (string.IsNullOrWhiteSpace(frontendBaseUrl))
            {
                frontendBaseUrl = "http://localhost:5173";
            }

            var resetLink = $"{frontendBaseUrl.TrimEnd('/')}/?resetToken={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(profile.Email)}";
            await _emailSender.SendPasswordResetEmailAsync(profile.Email, resetLink);
        }

        return Ok(
            new
            {
                message =
                    "If an account exists for that email, a password reset link has been sent.",
            }
        );
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (!await _recaptchaValidator.IsValidAsync(request.CaptchaToken))
        {
            return BadRequest(new { message = "Captcha verification failed." });
        }

        if (!IsValidPassword(request.NewPassword))
        {
            return BadRequest(new { message = "Password must be at least 8 characters." });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var profile = await _db.Profiles.FirstOrDefaultAsync(item => item.Email == email);
        if (profile is null)
        {
            return BadRequest(new { message = "Invalid reset request." });
        }

        if (
            string.IsNullOrWhiteSpace(profile.PasswordResetTokenHash)
            || profile.PasswordResetTokenExpiresAtUtc is null
            || profile.PasswordResetTokenExpiresAtUtc <= DateTime.UtcNow
        )
        {
            return BadRequest(new { message = "Reset token is invalid or expired." });
        }

        var incomingHash = HashToken(request.Token);
        if (!CryptographicOperations.FixedTimeEquals(
                Convert.FromHexString(profile.PasswordResetTokenHash),
                Convert.FromHexString(incomingHash)
            ))
        {
            return BadRequest(new { message = "Reset token is invalid or expired." });
        }

        var (hash, salt) = _passwordHashingService.HashPassword(request.NewPassword);
        profile.PasswordHash = hash;
        profile.PasswordSalt = salt;
        profile.PasswordResetTokenHash = null;
        profile.PasswordResetTokenExpiresAtUtc = null;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully." });
    }

    private async Task SignInProfileAsync(ProfileEntity profile)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, profile.Id.ToString()),
            new(ClaimTypes.Email, profile.Email),
            new(ClaimTypes.Name, profile.Email),
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
    }

    private static string CreateToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private static string HashToken(string token)
    {
        var hash = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hash);
    }

    private static bool IsValidPassword(string password)
    {
        return !string.IsNullOrWhiteSpace(password) && password.Length >= 8;
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
}
