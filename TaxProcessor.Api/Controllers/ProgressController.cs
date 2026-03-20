using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxProcessor.Api.Data;
using TaxProcessor.Api.Models;

namespace TaxProcessor.Api.Controllers;

[ApiController]
[Route("api/progress")]
public class ProgressController(TaxDbContext db) : ControllerBase
{
    private readonly TaxDbContext _db = db;

    [HttpGet("years")]
    public async Task<ActionResult<int[]>> GetYears()
    {
        var years = await _db.TaxProgress
            .Select(progress => progress.Year)
            .Distinct()
            .OrderByDescending(year => year)
            .ToArrayAsync();
        return Ok(years);
    }

    [HttpGet("names")]
    public async Task<ActionResult<string[]>> GetAllNames()
    {
        var names = await _db.TaxProgress
            .Select(progress => progress.Name)
            .ToArrayAsync();
        return Ok(names);
    }

    [HttpGet("{year}/names")]
    public async Task<ActionResult<string[]>> GetNames(int year)
    {
        var names = await _db.TaxProgress
            .Where(progress => progress.Year == year)
            .Select(progress => progress.Name)
            .ToArrayAsync();
        return Ok(names);
    }


    [HttpGet("{year}/{name}")]
    [HttpGet("get/{year}/{name}")]
    public async Task<ActionResult<TaxProgress>> GetProgress(int year, string name)
    {
        var entity = await GetTaxProgressEntity(year, name);

        if (entity is null)
        {
            return NotFound(new { message = "Progress not found." });
        }

        if (!Enum.TryParse<Steps>(entity.CurrentStepId, ignoreCase: true, out var step))
        {
            return BadRequest(new { message = "Invalid current step value." });
        }

        return Ok(new TaxProgress
        {
            Year = entity.Year,
            Name = entity.Name,
            UpdatedAt = entity.UpdatedAt,
            CurrentStep = step,
            Responses = entity.GetResponses(),
        });
    }

    [HttpPost("save")]
    public async Task<ActionResult<TaxProgress>> SaveProgress([FromBody] SaveTaxProgressRequest request)
    {
        var now = DateTime.UtcNow;

        var entity = await GetTaxProgressEntity(request.Year, request.Name);

        if (entity is null)
        {
            entity = new TaxProgressEntity
            {
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

        entity.UpdateResponses(request.Responses, request.Year, request.Name);   

        await _db.SaveChangesAsync();

        return Ok(new TaxProgress
        {
            Year = entity.Year,
            Name = entity.Name,
            UpdatedAt = entity.UpdatedAt,
            CurrentStep = step,
            Responses = entity.GetResponses(),
        });
    }

    [HttpDelete("{year}/{name}")]
    [HttpDelete("delete/{year}/{name}")]
    public async Task<ActionResult> ClearProgress(int year, string name)
    {
        var entity = await _db.TaxProgress.FindAsync(year, name);
        if (entity is null)
        {
            return NotFound(new { message = "Progress not found." });
        }

        _db.TaxProgress.Remove(entity);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Progress cleared successfully." });
    }

    private async Task<TaxProgressEntity?> GetTaxProgressEntity(int year, string name)
    {
        return await _db.TaxProgress
            .Include(progress => progress.Responses)
            .FirstOrDefaultAsync(progress => progress.Year == year && progress.Name == name);
    }
}
