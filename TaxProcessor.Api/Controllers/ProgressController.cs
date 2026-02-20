using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxProcessor.Api.Data;
using TaxProcessor.Api.Models;

namespace TaxProcessor.Api.Controllers;

[ApiController]
[Route("api/progress")]
public class ProgressController : ControllerBase
{
    private readonly TaxDbContext _db;

    public ProgressController(TaxDbContext db)
    {
        _db = db;
    }

    [HttpGet("years")]
    public async Task<ActionResult<int[]>> GetYears()
    {
        var years = await _db.TaxProgress
            .Select(p => p.Year)
            .Distinct()
            .OrderByDescending(y => y)
            .ToArrayAsync();
        return Ok(years);
    }

    [HttpGet("names")]
    public async Task<ActionResult<string[]>> GetAllNames()
    {
        var names = await _db.TaxProgress
            .Select(p => p.Name)
            .ToArrayAsync();
        return Ok(names);
    }

    [HttpGet("{year}/names")]
    public async Task<ActionResult<string[]>> GetNames(int year)
    {
        var names = await _db.TaxProgress
            .Where(p => p.Year == year)
            .Select(p => p.Name)
            .ToArrayAsync();
        return Ok(names);
    }


    [HttpGet("{year}/{name}")]
    public async Task<ActionResult<TaxProgress>> GetProgress(int year, string name)
    {
        var entity = await _db.TaxProgress.FindAsync(year, name);
        if (entity is null)
        {
            return NotFound(new { message = "Progress not found." });
        }

        return Ok(new TaxProgress
        {
            Year = entity.Year,
            Name = entity.Name,
            UpdatedAt = entity.UpdatedAt,
            CurrentStep = entity.CurrentStepId,
            Responses = entity.Responses,
        });
    }

    [HttpPost("save")]
    public async Task<ActionResult<TaxProgress>> SaveProgress([FromBody] SaveTaxProgressRequest request)
    {
        var now = DateTime.UtcNow;

        var entity = await _db.TaxProgress.FindAsync(request.Year, request.Name);
        if (entity is null)
        {
            entity = new TaxProgressEntity
            {
                Name = request.Name,
                Year = request.Year,
                UpdatedAt = now,
                CurrentStepId = request.CurrentStep,
                Responses = request.Responses ?? Array.Empty<TaxResponse>(),
            };
            _db.TaxProgress.Add(entity);
        }
        else
        {
            entity.UpdatedAt = now;
            entity.CurrentStepId = request.CurrentStep;
            entity.Responses = request.Responses ?? Array.Empty<TaxResponse>();
        }

        await _db.SaveChangesAsync();

        return Ok(new TaxProgress
        {
            Year = entity.Year,
            Name = entity.Name,
            UpdatedAt = entity.UpdatedAt,
            CurrentStep = entity.CurrentStepId,
            Responses = entity.Responses,
        });
    }

    [HttpDelete("{year}/{name}")]
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
}
