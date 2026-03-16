using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using TaxProcessor.Api.Data;
using TaxProcessor.Api.Models;

namespace TaxProcessor.Api.Controllers;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum StandardDeductionOption
{
    [JsonPropertyName("single")]
    single,
    [JsonPropertyName("marriedFilingJointly")]
    marriedFilingJointly,
    [JsonPropertyName("headOfHousehold")]
    headOfHousehold,
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
            new()
            {
                Step = GetStepValue(Steps.TaxAndCredits),
                Title = "Tax and credits",
                Description = "Provide information about your tax situation to identify potential credits and deductions.",
                Fields =
                [
                    new()
                    {
                        Form = TaxForm.Form1040.ToString(),
                        TaxFieldLabel = TaxFieldLabel.twoE.ToString(),
                        Label = "Standard deduction",
                        Type = GetTaxFieldTypeValue(TaxFieldType.Select),
                        HelperText = "Select the standard deduction amount for your filing status.",
                        SelectionOptions =
                        [
                            $"Single: ${GetStandardDeductionAmount(StandardDeductionOption.single)}",
                            $"Married Filing Jointly: ${GetStandardDeductionAmount(StandardDeductionOption.marriedFilingJointly)}",
                            $"Head of Household: ${GetStandardDeductionAmount(StandardDeductionOption.headOfHousehold)}",
                        ],
                        Subsection = TaxStep.GetStepValue(Steps.TaxAndCredits),
                }
            ]
        }
        };

        var standardDeductions = new Dictionary<StandardDeductionOption, decimal>
        {
            { StandardDeductionOption.single, GetStandardDeductionAmount(StandardDeductionOption.single) },
            { StandardDeductionOption.marriedFilingJointly, GetStandardDeductionAmount(StandardDeductionOption.marriedFilingJointly) },
            { StandardDeductionOption.headOfHousehold, GetStandardDeductionAmount(StandardDeductionOption.headOfHousehold) },
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

    private static decimal GetStandardDeductionAmount(StandardDeductionOption option)
    {
        return option switch
        {
            StandardDeductionOption.single => 15750m,
            StandardDeductionOption.marriedFilingJointly => 31500m,
            StandardDeductionOption.headOfHousehold => 23625m,
            _ => 0m,
        };
    }

    private static string GetStepValue(Steps step)
    {
        return step switch
        {
            Steps.Income => "income",
            Steps.TaxAndCredits => "taxAndCredits",
            Steps.PaymentsAndRefundableCredits => "paymentsAndRefundableCredits",
            Steps.RefundOwe => "refundOwe",
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
        public Dictionary<StandardDeductionOption, decimal> StandardDeductions { get; set; } = [];
    }
}
