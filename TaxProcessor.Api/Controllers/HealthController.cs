using Microsoft.AspNetCore.Mvc;

namespace TaxProcessor.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<object> GetHealth()
    {
        return Ok(new { status = "ok", time = DateTime.UtcNow.ToString("o") });
    }
}
