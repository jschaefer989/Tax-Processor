using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxProcessor.Api.Data;

namespace TaxProcessor.Api.Controllers;

[ApiController]
[Route("api/start")]
public class StartController(TaxDbContext context) : ControllerBase
{
    private readonly TaxDbContext _db = context;

    [HttpDelete("year/{year}")]
    public async Task<ActionResult> DeleteYear(int year)
    {
        try
        {
            var names = await _db.TaxProgress
                .Where(progress => progress.Year == year)
                .Select(progress => progress.Name)
                .ToListAsync();

            foreach (var name in names)
            {
                var entity = await _db.TaxProgress.FirstOrDefaultAsync(progress => progress.Year == year && progress.Name == name);
                if (entity != null)
                {
                    _db.TaxProgress.Remove(entity);
                }
            }

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
        try
        {
            var entity = await _db.TaxProgress
                .Where(progress => progress.Year == year && progress.Name == name)
                .FirstOrDefaultAsync();

            if (entity != null)
            {
                _db.TaxProgress.Remove(entity);
            }

            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Error deleting year {year}: {ex.Message}" });
        }

        return Ok(new { message = "Year deleted successfully." });
    }
}