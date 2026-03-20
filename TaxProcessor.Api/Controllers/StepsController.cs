using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using TaxProcessor.Api.Data;
using TaxProcessor.Api.Models;

namespace TaxProcessor.Api.Controllers;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum FilingStatus
{
    [JsonPropertyName("single")]
    single,
    [JsonPropertyName("marriedFilingJointly")]
    marriedFilingJointly,
    [JsonPropertyName("marriedFilingSeparately")]
    marriedFilingSeparately,
    [JsonPropertyName("headOfHousehold")]
    headOfHousehold,
    [JsonPropertyName("qualifyingWidow")]
    qualifyingWidow,
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
                Step = GetStepValue(Steps.Demographics),
                Title = "Demographics",
                Description = "Provide basic information about yourself to get started.",
                Fields =
                [
                    new()
                    {
                        Form = TaxForm.Form1040.ToString(),
                        TaxFieldLabel = TaxFieldLabel.oneD.ToString(),
                        Label = "Filing status",
                        Type = GetTaxFieldTypeValue(TaxFieldType.Select),
                        HelperText = "Select your filing status for the tax year.",
                        SelectionOptions =
                        [
                            new SelectionOption("single", "Single"),
                            new SelectionOption("marriedFilingJointly", "Married Filing Jointly"),
                            new SelectionOption("marriedFilingSeparately", "Married Filing Separately"),
                            new SelectionOption("headOfHousehold", "Head of Household"),
                            new SelectionOption("qualifyingWidow", "Qualifying Widow(er)"),
                        ],
                        Subsection = TaxStep.GetStepValue(Steps.Demographics),
                        IsRequired = true,
                    },
                ]
            },
            new()
            {
                Step = GetStepValue(Steps.Income),
                Title = "Income overview",
                Description = "Enter high-level income details to determine required forms.",
                Fields =
                [
                    new()
                    {
                        Form = TaxForm.Form1040.ToString(),
                        TaxFieldLabel = TaxFieldLabel.oneA.ToString(),
                        Label = "W-2 wages (total)",
                        Type = GetTaxFieldTypeValue(TaxFieldType.Currency),
                        HelperText = "Use the total from all W-2s before taxes.",
                        Subsection = TaxStep.GetStepValue(Steps.Income),
                    },
                ],
                Files =
                [
                    new()
                    {
                        FromForm = ReadableForm.Form1099.ToString(),
                        ToForm = TaxForm.Form1040.ToString(),
                        Label = "1099 Form(s)",
                    },
                ],
            },
        };

        var standardDeductions = new Dictionary<FilingStatus, decimal>
        {
            { FilingStatus.single, GetStandardDeductionAmount(FilingStatus.single) },
            { FilingStatus.marriedFilingJointly, GetStandardDeductionAmount(FilingStatus.marriedFilingJointly) },
            { FilingStatus.marriedFilingSeparately, GetStandardDeductionAmount(FilingStatus.marriedFilingSeparately) },
            { FilingStatus.headOfHousehold, GetStandardDeductionAmount(FilingStatus.headOfHousehold) },
            { FilingStatus.qualifyingWidow, GetStandardDeductionAmount(FilingStatus.qualifyingWidow) },

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
            FilingStatus.single => 15750m,
            FilingStatus.marriedFilingJointly => 31500m,
            FilingStatus.marriedFilingSeparately => 15750m,
            FilingStatus.headOfHousehold => 23625m,
            FilingStatus.qualifyingWidow => 31500m,
            _ => 0m,
        };
    }

    public static string GetStepValue(Steps step)
    {
        return step switch
        {
            Steps.Demographics => "demographics",
            Steps.Income => "income",
            Steps.TaxAndCredits => "taxAndCredits",
            Steps.PaymentsAndRefundableCredits => "paymentsAndRefundableCredits",
            _ => throw new ArgumentOutOfRangeException(nameof(step), step, null),
        };
    }

    private static string GetTaxFieldTypeValue(TaxFieldType type)
    {
        return type switch
        {
            TaxFieldType.Text => "text",
            TaxFieldType.Number => "number",
            TaxFieldType.Currency => "currency",
            TaxFieldType.Date => "date",
            TaxFieldType.Select => "select",
            _ => throw new ArgumentOutOfRangeException(nameof(type), type, null),
        };
    }

    public class StepsResponse
    {
        public List<TaxStep> Steps { get; set; } = [];
        public Dictionary<FilingStatus, decimal> StandardDeductions { get; set; } = [];
    }
}
