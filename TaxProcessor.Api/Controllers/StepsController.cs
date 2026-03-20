using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using TaxProcessor.Api.Data;
using TaxProcessor.Api.Models;
using TaxProcessor.Api.Models.Requests;

namespace TaxProcessor.Api.Controllers;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum FilingStatus
{
    [JsonPropertyName("single")]
    Single,
    [JsonPropertyName("marriedFilingJointly")]
    MarriedFilingJointly,
    [JsonPropertyName("marriedFilingSeparately")]
    MarriedFilingSeparately,
    [JsonPropertyName("headOfHousehold")]
    HeadOfHousehold,
    [JsonPropertyName("qualifyingWidow")]
    QualifyingWidow,
}

[ApiController]
[Route("api/steps")]
public class StepsController : ControllerBase
{
    [HttpGet]
    public ActionResult<TaxStep> GetSteps()
    {
        var steps = new List<TaxStep>
        {
            new()
            {
                Step = Steps.Demographics,
                Title = "Demographics",
                Description = "Provide basic information about yourself to get started.",
                Fields =
                [
                    new()
                    {
                        Form = TaxForm.Form1040,
                        TaxFieldLabel = TaxFieldLabel.FilingStatus,
                        Label = "Filing status",
                        Type = TaxFieldType.Select,
                        HelperText = "Select your filing status for the tax year.",
                        SelectionOptions =
                        [
                            new SelectionOption(FilingStatus.Single.ToString(), "Single"),
                            new SelectionOption(FilingStatus.MarriedFilingJointly.ToString(), "Married Filing Jointly"),
                            new SelectionOption(FilingStatus.MarriedFilingSeparately.ToString(), "Married Filing Separately"),
                            new SelectionOption(FilingStatus.HeadOfHousehold.ToString(), "Head of Household"),
                            new SelectionOption(FilingStatus.QualifyingWidow.ToString(), "Qualifying Widow(er)"),
                        ],
                        Subsection = TaxStep.GetStepValue(Steps.Demographics),
                        IsRequired = true,
                    },
                ]
            },
            new()
            {
                Step = Steps.Income,
                Title = "Income overview",
                Description = "Enter high-level income details to determine required forms.",
                Fields =
                [
                    new()
                    {
                        Form = TaxForm.Form1040,
                        TaxFieldLabel = TaxFieldLabel.oneA,
                        Label = "W-2 wages (total)",
                        Type = TaxFieldType.Currency,
                        HelperText = "Use the total from all W-2s before taxes.",
                        Subsection = TaxStep.GetStepValue(Steps.Income),
                    },
                ],
                Files =
                [
                    new()
                    {
                        FromForm = ReadableForm.Form1099,
                        ToForm = TaxForm.Form1040,
                        Label = "1099 Form(s)",
                    },
                ],
            },
            new()
            {
                Step = Steps.TaxAndCredits,
                Title = "Tax and credits",
                Description = "Provide information about tax and credits to calculate your tax liability.",
                Buttons =
                [
                    new()
                    {
                        Form = TaxForm.Form1040,
                        TaxFieldLabel = TaxFieldLabel.twelveE,
                        Label = "Standard deduction",
                        CalculationCallback = FieldCalculationCallback.StandardDeduction,
                        Subsection = TaxStep.GetStepValue(Steps.TaxAndCredits),
                    },
                ]
            }
        };

        return Ok(steps);
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

    [HttpPost("calculate-field")]
    public async Task<ActionResult<string>> CalculateField([FromBody] CalculateFieldRequest request)
    {
        switch (request.CalculationCallback)
        {
            case FieldCalculationCallback.StandardDeduction:
                if (Enum.TryParse(request.Value, out FilingStatus filingStatus))
                {
                    return Ok(TaxCalculator.GetStandardDeductionAmount(filingStatus));
                }
                else
                {
                    return BadRequest(new { message = "Invalid filing status." });
                }
            default:
                return BadRequest(new { message = "Unsupported calculation callback." });
        }
    }
}
