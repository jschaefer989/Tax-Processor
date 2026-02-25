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
        var entity = await _db.TaxProgress
            .Include(p => p.Responses)
            .FirstOrDefaultAsync(p => p.Year == year && p.Name == name);
        
        if (entity is null)
        {
            return NotFound(new { message = "Progress not found." });
        }

        // Map TaxResponseEntity back to TaxResponse model
        var responses = entity.Responses
            .Select(r => new TaxResponse
            {
                Form = Enum.Parse<TaxForm>(r.Form),
                Label = Enum.Parse<TaxFieldLabel>(r.Label),
                Line = r.Line,
                Value = r.Value
            })
            .ToArray();

        return Ok(new TaxProgress
        {
            Year = entity.Year,
            Name = entity.Name,
            UpdatedAt = entity.UpdatedAt,
            CurrentStep = entity.CurrentStepId,
            Responses = responses,
        });
    }

    [HttpPost("save")]
    public async Task<ActionResult<TaxProgress>> SaveProgress([FromBody] SaveTaxProgressRequest request)
    {
        var now = DateTime.UtcNow;

        var entity = await _db.TaxProgress
            .Include(p => p.Responses)
            .FirstOrDefaultAsync(p => p.Year == request.Year && p.Name == request.Name);

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
            // Clear existing responses for this record
            entity.Responses.Clear();
        }

        // Convert TaxResponse models to TaxResponseEntity
        if (request.Responses != null)
        {
            foreach (var response in request.Responses)
            {
                entity.Responses.Add(new TaxResponseEntity
                {
                    Year = request.Year,
                    Name = request.Name,
                    Form = response.Form.ToString(),
                    Label = response.Label.ToString(),
                    Line = response.Line,
                    Value = response.Value
                });
            }
        }

        await _db.SaveChangesAsync();

        // Return updated progress
        var responses = entity.Responses
            .Select(r => new TaxResponse
            {
            Form = Enum.Parse<TaxForm>(r.Form),
            Label = Enum.Parse<TaxFieldLabel>(r.Label),
            Line = r.Line,
            Value = r.Value
            })
            .ToArray();

        return Ok(new TaxProgress
        {
            Year = entity.Year,
            Name = entity.Name,
            UpdatedAt = entity.UpdatedAt,
            CurrentStep = entity.CurrentStepId,
            Responses = responses,
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
