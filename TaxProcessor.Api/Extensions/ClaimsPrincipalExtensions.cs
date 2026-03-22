using System.Security.Claims;

namespace TaxProcessor.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetProfileId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(value) || !Guid.TryParse(value, out var profileId))
        {
            throw new InvalidOperationException("Authenticated profile id claim is missing.");
        }

        return profileId;
    }
}
