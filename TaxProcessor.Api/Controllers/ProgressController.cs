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
            .TaxProgress.Where(progress => progress.ProfileId == profileId)
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
            .TaxProgress.Where(progress => progress.ProfileId == profileId)
            .Select(progress => progress.Name)
            .ToArrayAsync();
        return Ok(names);
    }

    [HttpGet("{year}/names")]
    public async Task<ActionResult<string[]>> GetNames(int year)
    {
        var profileId = User.GetProfileId();
        var names = await _db
            .TaxProgress.Where(progress => progress.ProfileId == profileId && progress.Year == year)
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

        var entity = await GetTaxProgressEntity(profileId, request.Year, request.Name);

        if (entity is null)
        {
            entity = new TaxProgressEntity
            {
                ProfileId = profileId,
                Name = request.Name,
                Year = request.Year,
                UpdatedAt = now,
                CurrentStepId = request.CurrentStep,
                Responses = new List<TaxResponseEntity>(),
            };
            _db.TaxProgress.Add(entity);
        }
        else
        {
            entity.UpdatedAt = now;
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
                CurrentStep = step,
                Responses = entity.GetResponses(),
            }
        );
    }

    [HttpDelete("{year}/{name}")]
    [HttpDelete("delete/{year}/{name}")]
    public async Task<ActionResult> ClearProgress(int year, string name)
    {
        var profileId = User.GetProfileId();
        var entity = await _db.TaxProgress.FindAsync(profileId, year, name);
        if (entity is null)
        {
            return NotFound(new { message = "Progress not found." });
        }

        _db.TaxProgress.Remove(entity);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Progress cleared successfully." });
    }

    private async Task<TaxProgressEntity?> GetTaxProgressEntity(Guid profileId, int year, string name)
    {
        return await _db
            .TaxProgress.Include(progress => progress.Responses)
            .FirstOrDefaultAsync(progress =>
                progress.ProfileId == profileId && progress.Year == year && progress.Name == name
            );
    }
}
