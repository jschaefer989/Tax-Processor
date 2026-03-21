using System.Globalization;
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
public class StepsController(StandardDeductionFetcher standardDeductionFetcher) : ControllerBase
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
                            new SelectionOption(
                                FilingStatus.MarriedFilingJointly.ToString(),
                                "Married Filing Jointly"
                            ),
                            new SelectionOption(
                                FilingStatus.MarriedFilingSeparately.ToString(),
                                "Married Filing Separately"
                            ),
                            new SelectionOption(
                                FilingStatus.HeadOfHousehold.ToString(),
                                "Head of Household"
                            ),
                            new SelectionOption(
                                FilingStatus.QualifyingWidow.ToString(),
                                "Qualifying Widow(er)"
                            ),
                        ],
                        Subsection = TaxStep.GetStepValue(Steps.Demographics),
                        IsRequired = true,
                    },
                ],
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
                Description =
                    "Provide information about tax and credits to calculate your tax liability.",
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
                    new()
                    {
                        Form = TaxForm.Form1040,
                        TaxFieldLabel = TaxFieldLabel.sixteen,
                        Label = "Calculate tax",
                        CalculationCallback = FieldCalculationCallback.Tax,
                        Subsection = TaxStep.GetStepValue(Steps.TaxAndCredits),
                    },
                ],
            },
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
        if (request.Responses is null)
        {
            return BadRequest(new { message = "Responses are required for field calculation." });
        }
        var filingStatusResponse = TaxResponse.GetResponseValue(
            [.. request.Responses],
            TaxForm.Form1040,
            TaxFieldLabel.FilingStatus
        );

        Dictionary<FilingStatus, int>? standardDeductions;
        try
        {
            standardDeductions = await standardDeductionFetcher.GetStandardDeductionsAsync();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error fetching standard deductions: {ex.Message}" });
        }

        FilingStatus filingStatus;
        if (!Enum.TryParse(filingStatusResponse, out filingStatus))
        {
            return BadRequest(new { message = "Invalid filing status." });
        }

        switch (request.CalculationCallback)
        {
            case FieldCalculationCallback.StandardDeduction:
                return Ok(standardDeductions[filingStatus]);
            case FieldCalculationCallback.Tax:
                var taxCalculator = new TaxCalculator(standardDeductionFetcher, filingStatus);

                var w2Wages = TaxResponse.GetResponseValue(
                    [.. request.Responses],
                    TaxForm.Form1040,
                    TaxFieldLabel.oneA
                );
                int w2WagesNumber;
                if (!TaxResponse.TryParseCurrency(w2Wages, out w2WagesNumber))
                {
                    return BadRequest(new { message = "Invalid W-2 wages amount." });
                }

                var ordinaryDividends = TaxResponse.GetResponseValue(
                    [.. request.Responses],
                    TaxForm.Form1040,
                    TaxFieldLabel.threeB
                );
                int ordinaryDividendsNumber;
                if (!TaxResponse.TryParseCurrency(ordinaryDividends, out ordinaryDividendsNumber))
                {
                    ordinaryDividendsNumber = 0; // Treat invalid or missing dividends as zero
                }

                var taxableInterest = TaxResponse.GetResponseValue(
                    [.. request.Responses],
                    TaxForm.Form1040,
                    TaxFieldLabel.twoB
                );
                int taxableInterestNumber;
                if (!TaxResponse.TryParseCurrency(taxableInterest, out taxableInterestNumber))
                {
                    taxableInterestNumber = 0; // Treat invalid or missing taxable interest as zero
                }

                taxCalculator.W2Wages = w2WagesNumber;
                taxCalculator.OrdinaryDividends = ordinaryDividendsNumber;
                taxCalculator.TaxableInterest = taxableInterestNumber;

                return Ok(taxCalculator.CalculateTaxableIncome());
            default:
                return BadRequest(new { message = "Unsupported calculation callback." });
        }
    }
}
