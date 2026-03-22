using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authorization;
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
[Authorize]
[Route("api/steps")]
public class StepsController(
    StandardDeductionFetcher standardDeductionFetcher,
    Func<FilingStatus, TaxCalculator> taxCalculatorFactory,
    FileProcessor fileProcessor
) : ControllerBase
{
    private readonly StandardDeductionFetcher _standardDeductionFetcher = standardDeductionFetcher;
    private readonly Func<FilingStatus, TaxCalculator> _taxCalculatorFactory =
        taxCalculatorFactory;
    private readonly FileProcessor _fileProcessor = fileProcessor;

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
                        HelperText =
                            "Verify that this matches the standard deduction for your filing status.",
                    },
                    new()
                    {
                        Form = TaxForm.Form1040,
                        TaxFieldLabel = TaxFieldLabel.fifteen,
                        Label = "Calculate taxable income",
                        CalculationCallback = FieldCalculationCallback.TaxableIncome,
                        Subsection = TaxStep.GetStepValue(Steps.TaxAndCredits),
                        HelperText = "Verify that this matches the auto-calculated taxable income.",
                    },
                    new()
                    {
                        Form = TaxForm.Form1040,
                        TaxFieldLabel = TaxFieldLabel.sixteen,
                        Label = "Calculate tax",
                        CalculationCallback = FieldCalculationCallback.Tax,
                        Subsection = TaxStep.GetStepValue(Steps.TaxAndCredits),
                        HelperText =
                            "Only the tax table and the qualified dividends "
                            + "and capital gains are considered. Double check using the instructions "
                            + "for line 16 that you don't have additional taxes like form 8615, "
                            + "foreign income tax, or schedule D.",
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
            var result = await _fileProcessor.ProcessFile(request.File, form);
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

    // TODO: make this into a bunch of separate API calls instead of one big one that does everything.
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
            standardDeductions = await _standardDeductionFetcher.GetStandardDeductionsAsync();
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                new { message = $"Error fetching standard deductions: {ex.Message}" }
            );
        }

        if (!Enum.TryParse(filingStatusResponse, out FilingStatus filingStatus))
        {
            return BadRequest(new { message = "Invalid filing status." });
        }

        switch (request.CalculationCallback)
        {
            case FieldCalculationCallback.StandardDeduction:
                return Ok(standardDeductions[filingStatus]);
            case FieldCalculationCallback.TaxableIncome:
                int taxableIncome;
                try
                {
                    var taxCalculator = GetTaxCalculatorFromResponses(
                        request.CalculationCallback,
                        request.Responses
                    );
                    taxCalculator.SetIncomeSources(request.Responses);
                    taxableIncome = taxCalculator.CalculateTaxableIncome();
                }
                catch (Exception ex)
                {
                    return BadRequest(
                        new { message = $"Error calculating taxable income: {ex.Message}" }
                    );
                }
                return Ok(taxableIncome);
            case FieldCalculationCallback.Tax:
                int tax;
                try
                {
                    var taxCalculator = GetTaxCalculatorFromResponses(
                        request.CalculationCallback,
                        request.Responses
                    );
                    taxCalculator.SetIncomeSources(request.Responses);
                    tax = await taxCalculator.CalculateTaxAsync(request.Responses);
                }
                catch (Exception ex)
                {
                    return BadRequest(
                        new { message = $"Error calculating tax: {ex.Message}" }
                    );
                }
                return Ok(tax);
            default:
                return BadRequest(new { message = "Unsupported calculation callback." });
        }
    }

    private TaxCalculator GetTaxCalculatorFromResponses(
        FieldCalculationCallback callback,
        TaxResponse[] responses
    )
    {
        switch (callback)
        {
            case FieldCalculationCallback.StandardDeduction:
                // Standard deduction doesn't require a tax calculator instance, so we can return early.
                return null!;
            case FieldCalculationCallback.TaxableIncome:
            case FieldCalculationCallback.Tax:
                break;
            default:
                throw new InvalidOperationException("Unsupported calculation callback.");
        }

        var filingStatusResponse = TaxResponse.GetResponseValue(
            [.. responses],
            TaxForm.Form1040,
            TaxFieldLabel.FilingStatus
        );

        if (!Enum.TryParse(filingStatusResponse, out FilingStatus filingStatus))
        {
            throw new InvalidOperationException("Invalid filing status in responses.");
        }

        return _taxCalculatorFactory(filingStatus);
    }
}
