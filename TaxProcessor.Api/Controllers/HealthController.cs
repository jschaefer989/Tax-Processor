using Microsoft.AspNetCore.Mvc;
using Npgsql;
using TaxProcessor.Api.Data;
using TaxProcessor.Api.Models;
using TaxProcessor.Api.Models.Requests;

namespace TaxProcessor.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController(TaxDbContext db) : ControllerBase
{
    private readonly TaxDbContext _db = db;

    [HttpGet]
    public ActionResult<object> GetHealth()
    {
        return Ok(new { status = "ok", time = DateTime.UtcNow.ToString("o") });
    }

    [HttpGet("db")]
    public ActionResult<object> GetDatabaseHealth()
    {
        var provider = _db.Database.ProviderName ?? "unknown";
        var connected = !provider.Contains("InMemory", StringComparison.OrdinalIgnoreCase);

        return Ok(new { connected, provider });
    }

    [HttpPost("db/test")]
    public async Task<ActionResult<object>> TestDatabaseConnection(
        [FromBody] DbConnectionTestRequest request
    )
    {
        if (
            string.IsNullOrWhiteSpace(request.Host)
            || string.IsNullOrWhiteSpace(request.Database)
            || string.IsNullOrWhiteSpace(request.Username)
        )
        {
            return BadRequest(new { message = "Host, database, and username are required." });
        }

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = request.Host,
            Port = request.Port > 0 ? request.Port : 5432,
            Database = request.Database,
            Username = request.Username,
            Password = request.Password ?? string.Empty,
            Timeout = 3,
            CommandTimeout = 3,
        };

        try
        {
            await using var connection = new NpgsqlConnection(builder.ConnectionString);
            await connection.OpenAsync();

            return Ok(new { connected = true });
        }
        catch (Exception ex)
        {
            return StatusCode(
                503,
                new
                {
                    connected = false,
                    message = string.IsNullOrWhiteSpace(ex.Message)
                        ? "Unable to connect to database."
                        : ex.Message,
                }
            );
        }
    }
}
