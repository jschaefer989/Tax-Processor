using Microsoft.EntityFrameworkCore;

namespace TaxProcessor.Api.Data;

[PrimaryKey(nameof(Id))]
[Index(nameof(Email), IsUnique = true)]
public class ProfileEntity
{
    public Guid Id { get; set; }

    public required string Email { get; set; }

    public required string PasswordHash { get; set; }

    public required string PasswordSalt { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime LastLoginAtUtc { get; set; }

    public string? PasswordResetTokenHash { get; set; }

    public DateTime? PasswordResetTokenExpiresAtUtc { get; set; }

    public string? LoginOtpCodeHash { get; set; }

    public DateTime? LoginOtpCodeExpiresAtUtc { get; set; }

    public string? LoginOtpChallengeTokenHash { get; set; }

    public ICollection<TaxProgressEntity> ProgressEntries { get; set; } = [];
}
