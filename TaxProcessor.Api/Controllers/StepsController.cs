using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using TaxProcessor.Api.Data;
using TaxProcessor.Api.Models;

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
    public ActionResult<StepsResponse> GetSteps()
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
                        TaxFieldLabel = TaxFieldLabel.Skip,
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
        };

        var standardDeductions = new Dictionary<FilingStatus, decimal>
        {
            { FilingStatus.Single, GetStandardDeductionAmount(FilingStatus.Single) },
            { FilingStatus.MarriedFilingJointly, GetStandardDeductionAmount(FilingStatus.MarriedFilingJointly) },
            { FilingStatus.MarriedFilingSeparately, GetStandardDeductionAmount(FilingStatus.MarriedFilingSeparately) },
            { FilingStatus.HeadOfHousehold, GetStandardDeductionAmount(FilingStatus.HeadOfHousehold) },
            { FilingStatus.QualifyingWidow, GetStandardDeductionAmount(FilingStatus.QualifyingWidow) },

        };

        return Ok(new StepsResponse
        {
            Steps = steps,
            StandardDeductions = standardDeductions,
        });
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
    public async Task<ActionResult<string>> CalculateField([FromForm] CalculateFieldRequest request)
    {
        switch (request.CalculationCallback)
        {
            case FieldCalculationCallback.StandardDeduction:
                if (Enum.TryParse(request.Value, out FilingStatus option))
                {
                    return Ok(GetStandardDeductionAmount(option).ToString());
                }
                else
                {
                    return BadRequest(new { message = "Invalid standard deduction option." });
                }
            default:
                return BadRequest(new { message = "Unsupported calculation callback." });
        }
    }

    private static decimal GetStandardDeductionAmount(FilingStatus option)
    {
        return option switch
        {
            FilingStatus.Single => 15750m,
            FilingStatus.MarriedFilingJointly => 31500m,
            FilingStatus.MarriedFilingSeparately => 15750m,
            FilingStatus.HeadOfHousehold => 23625m,
            FilingStatus.QualifyingWidow => 31500m,
            _ => 0m,
        };
    }

    public class StepsResponse
    {
        public List<TaxStep> Steps { get; set; } = [];
        public Dictionary<FilingStatus, decimal> StandardDeductions { get; set; } = [];
    }
}
