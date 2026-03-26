using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using TaxProcessor.Api.Data;
using TaxProcessor.Api.Extensions;
using TaxProcessor.Api.Models;
using TaxProcessor.Api.Models.Requests;

namespace TaxProcessor.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/progress")]
public class ProgressController(TaxDbContext db) : ControllerBase
{
    private readonly TaxDbContext _db = db;

    [HttpGet("years")]
    public async Task<ActionResult<int[]>> GetYears()
    {
        var profileId = User.GetProfileId();
        var years = await _db
            .TaxProgress.Where(progress => progress.ProfileId == profileId && progress.DeletedAtUtc == null)
            .Select(progress => progress.Year)
            .Distinct()
            .OrderByDescending(year => year)
            .ToArrayAsync();
        return Ok(years);
    }

    [HttpGet("names")]
    public async Task<ActionResult<string[]>> GetAllNames()
    {
        var profileId = User.GetProfileId();
        var names = await _db
            .TaxProgress.Where(progress => progress.ProfileId == profileId && progress.DeletedAtUtc == null)
            .Select(progress => progress.Name)
            .ToArrayAsync();
        return Ok(names);
    }

    [HttpGet("{year}/names")]
    public async Task<ActionResult<string[]>> GetNames(int year)
    {
        var profileId = User.GetProfileId();
        var names = await _db
            .TaxProgress.Where(progress =>
                progress.ProfileId == profileId && progress.Year == year && progress.DeletedAtUtc == null
            )
            .Select(progress => progress.Name)
            .ToArrayAsync();
        return Ok(names);
    }

    [HttpGet("{year}/{name}")]
    [HttpGet("get/{year}/{name}")]
    public async Task<ActionResult<TaxProgress>> GetProgress(int year, string name)
    {
        var profileId = User.GetProfileId();
        var entity = await GetTaxProgressEntity(profileId, year, name);

        if (entity is null)
        {
            return NotFound(new { message = "Progress not found." });
        }

        if (entity.DeletedAtUtc != null)
        {
            return NotFound(new { message = "Progress not found." });
        }

        if (!Enum.TryParse<Steps>(entity.CurrentStepId, ignoreCase: true, out var step))
        {
            return BadRequest(new { message = "Invalid current step value." });
        }

        return Ok(
            new TaxProgress
            {
                Year = entity.Year,
                Name = entity.Name,
                UpdatedAt = entity.UpdatedAt,
                Version = entity.Version,
                CurrentStep = step,
                Responses = entity.GetResponses(),
            }
        );
    }

    [HttpPost("save")]
    public async Task<ActionResult<TaxProgress>> SaveProgress(
        [FromBody] SaveTaxProgressRequest request
    )
    {
        var now = DateTime.UtcNow;
        var profileId = User.GetProfileId();

        var entity = await GetTaxProgressEntity(profileId, request.Year, request.Name, includeDeleted: true);

        if (entity is null)
        {
            if (request.ExpectedVersion is not null)
            {
                return Conflict(new { message = "This return was changed in another session. Reload and try again." });
            }

            entity = new TaxProgressEntity
            {
                ProfileId = profileId,
                Name = request.Name,
                Year = request.Year,
                UpdatedAt = now,
                Version = 1,
                DeletedAtUtc = null,
                CurrentStepId = request.CurrentStep,
                Responses = [],
            };
            _db.TaxProgress.Add(entity);
        }
        else
        {
            if (entity.DeletedAtUtc != null)
            {
                return Conflict(new { message = "This return was deleted in another session. Reload to continue." });
            }

            if (request.ExpectedVersion is null || request.ExpectedVersion.Value != entity.Version)
            {
                return Conflict(new { message = "This return was changed in another session. Reload and try again." });
            }

            entity.UpdatedAt = now;
            entity.Version += 1;
            entity.CurrentStepId = request.CurrentStep;
        }

        if (!Enum.TryParse<Steps>(entity.CurrentStepId, ignoreCase: true, out var step))
        {
            return BadRequest(new { message = "Invalid current step value." });
        }

        entity.UpdateResponses(request.Responses, profileId, request.Year, request.Name);

        await _db.SaveChangesAsync();

        return Ok(
            new TaxProgress
            {
                Year = entity.Year,
                Name = entity.Name,
                UpdatedAt = entity.UpdatedAt,
                Version = entity.Version,
                CurrentStep = step,
                Responses = entity.GetResponses(),
            }
        );
    }

    [HttpDelete("{year}/{name}")]
    [HttpDelete("delete/{year}/{name}")]
    public async Task<ActionResult> DeleteProgress(int year, string name)
    {
        var profileId = User.GetProfileId();
        var entity = await _db.TaxProgress.FindAsync(profileId, year, name);
        if (entity is null)
        {
            return NotFound(new { message = "Progress not found." });
        }

        entity.DeletedAtUtc = DateTime.UtcNow;
        entity.Version += 1;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Progress cleared successfully." });
    }

    private async Task<TaxProgressEntity?> GetTaxProgressEntity(
        Guid profileId,
        int year,
        string name,
        bool includeDeleted = false
    )
    {
        var query = _db.TaxProgress.Include(progress => progress.Responses).Where(progress =>
            progress.ProfileId == profileId && progress.Year == year && progress.Name == name
        );

        if (!includeDeleted)
        {
            query = query.Where(progress => progress.DeletedAtUtc == null);
        }

        return await query.FirstOrDefaultAsync();
    }
}
