using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using TaxProcessor.Api.Data;
using TaxProcessor.Api.Extensions;

namespace TaxProcessor.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/start")]
public class StartController(TaxDbContext context) : ControllerBase
{
    private readonly TaxDbContext _db = context;

    [HttpDelete("year/{year}")]
    public async Task<ActionResult> DeleteYear(int year)
    {
        var profileId = User.GetProfileId();
        try
        {
            var entries = await _db
                .TaxProgress.Where(progress => progress.ProfileId == profileId && progress.Year == year)
                .ToListAsync();

            entries.ForEach(entry => entry.Delete());            

            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Error deleting year {year}: {ex.Message}" });
        }

        return Ok(new { message = "Year deleted successfully." });
    }

    [HttpDelete("name/{year}/{name}")]
    public async Task<ActionResult> DeleteName(int year, string name)
    {
        var profileId = User.GetProfileId();
        try
        {
            var entity = await _db
                .TaxProgress.Where(progress =>
                    progress.ProfileId == profileId
                    && progress.Year == year
                    && progress.Name == name
                )
                .FirstOrDefaultAsync();

            entity?.Delete();

            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Error deleting year {year}: {ex.Message}" });
        }

        return Ok(new { message = "Year deleted successfully." });
    }
}
