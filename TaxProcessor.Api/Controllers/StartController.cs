using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxProcessor.Api.Data;

namespace TaxProcessor.Api.Controllers;

[ApiController]
[Route("api/start")]
public class StartController : ControllerBase
{
    private readonly TaxDbContext _db;

    public StartController(TaxDbContext context)
    {
        _db = context;
    }

    [HttpDelete("{year}")]
    public async Task<ActionResult> ClearProgress(int year)
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
}