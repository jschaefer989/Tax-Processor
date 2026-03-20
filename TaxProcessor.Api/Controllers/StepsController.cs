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
                    new()
                    {
                        Form = TaxForm.Form1040,
                        TaxFieldLabel = TaxFieldLabel.sixteen,
                        Label = "Calculate tax",
                        CalculationCallback = FieldCalculationCallback.Tax,
                        Subsection = TaxStep.GetStepValue(Steps.TaxAndCredits),
                    }
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
        if (request.Responses is null)
        {
            return BadRequest(new { message = "Responses are required for field calculation." });
        }
        var filingStatusResponse = GetResponseValue([.. request.Responses], TaxForm.Form1040, TaxFieldLabel.FilingStatus);
        FilingStatus filingStatus;
        switch (request.CalculationCallback)
        {
            case FieldCalculationCallback.StandardDeduction:

                if (Enum.TryParse(filingStatusResponse, out filingStatus))
                {
                    return Ok(TaxCalculator.GetStandardDeductionAmount(filingStatus));
                }
                else
                {
                    return BadRequest(new { message = "Invalid filing status." });
                }
            case FieldCalculationCallback.Tax:
            if (!Enum.TryParse(filingStatusResponse, out filingStatus))
                {
                    return BadRequest(new { message = "Invalid filing status." });
                }
                var taxCalculator = new TaxCalculator(filingStatus);

                var w2Wages = GetResponseValue([.. request.Responses], TaxForm.Form1040, TaxFieldLabel.oneA);
                int w2WagesNumber;
                if (!TryParseCurrency(w2Wages, out w2WagesNumber))
                {
                    return BadRequest(new { message = "Invalid W-2 wages amount." });
                }
                var ordinaryDividends = GetResponseValue([.. request.Responses], TaxForm.Form1040, TaxFieldLabel.threeB);
                int ordinaryDividendsNumber;
                if (!TryParseCurrency(ordinaryDividends, out ordinaryDividendsNumber))
                {
                    ordinaryDividendsNumber = 0; // Treat invalid or missing dividends as zero
                }         
                var taxableInterest = GetResponseValue([.. request.Responses], TaxForm.Form1040, TaxFieldLabel.twoB);
                int taxableInterestNumber;
                if (!TryParseCurrency(taxableInterest, out taxableInterestNumber))
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

    private static string? GetResponseValue(List<TaxResponse> responses, TaxForm form, TaxFieldLabel label)
    {
        return responses.FirstOrDefault(response => response.Form == form && response.Label == label)?.Value;
    }

    private static bool TryParseCurrency(string? value, out int parsed)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            parsed = 0;
            return false;
        }

        decimal decimalValue;
        if (decimal.TryParse(value, NumberStyles.Currency, CultureInfo.CurrentCulture, out decimalValue) ||
            decimal.TryParse(value, NumberStyles.Currency, CultureInfo.InvariantCulture, out decimalValue))
        {
            parsed = (int)Math.Round(decimalValue, MidpointRounding.AwayFromZero);
            return true;
        }

        parsed = 0;
        return false;
    }
}