using Microsoft.AspNetCore.Mvc;
using TaxProcessor.Api.Models;

namespace TaxProcessor.Api.Controllers;

[ApiController]
[Route("api/steps")]
public class StepsController : ControllerBase
{
    [HttpGet]
    public ActionResult<object> GetSteps()
    {
        var steps = new List<TaxStep>
        {
            new()
            {
                Step = "income",
                Title = "Income overview",
                Description = "Enter high-level income details to determine required forms.",
                Fields = new()
                {
                    new()
                    {
                        Form = TaxForm.Form1040.ToString(),
                        TaxFieldLabel = TaxFieldLabel.oneA.ToString(),
                        Label = "W-2 wages (total)",
                        Type = TaxFieldType.Currency.ToString(),
                        HelperText = "Use the total from all W-2s before taxes.",
                    },
                },
                Files = new()
                {
                    new()
                    {
                        FromForm = ReadableForm.Form1099.ToString(),
                        ToForm = TaxForm.Form1040.ToString(),
                        Label = "1099 Form(s)",
                    },
                },
            },
        };

        return Ok(new { steps });
    }

    [HttpPost("file")]
    public async Task<ActionResult<TaxResponse[]>> ProcessFile([FromForm] UploadFileRequest request)
    {
        if (Enum.TryParse(request.Form, out ReadableForm form))
        {
            var result = await new FileProcessor().ProcessFile(request.File, form);
            if (result.Success)
            {
                return Ok(result.Responses);
            }
            else
            {
                return BadRequest(new { message = result.ErrorMessage });
            }
        }
        else
        {
            return BadRequest(new { message = "Invalid form type." });
        }
    }

}
