using TaxProcessor.Api.Controllers;
using TaxProcessor.Api.Models;

namespace TaxProcessor.Api.Data;

public class TaxCalculator(
    StandardDeductionFetcher standardDeductionFetcher,
    FilingStatus filingStatus
)
{
    public int StandardDeduction =>
        DetermineStandardDeductionAsync(filingStatus).GetAwaiter().GetResult();
    public int? OrdinaryDividends { get; set; }
    public int? QualifiedDividends { get; set; }
    public int? TaxableInterest { get; set; }

    public int? W2Wages { get; set; }

    public int AdjustedGrossIncome => CalculateAdjustedGrossIncome();

    public int TaxableIncome => CalculateTaxableIncome();

    public async Task<int> DetermineStandardDeductionAsync(FilingStatus filingStatus)
    {
        Dictionary<FilingStatus, int> standardDeductions;
        try
        {
            standardDeductions = await standardDeductionFetcher.GetStandardDeductionsAsync();
        }
        catch (Exception ex)
        {
            throw new Exception($"Error fetching standard deductions: {ex.Message}");
        }

        if (standardDeductions.TryGetValue(filingStatus, out var deduction))
        {
            return deduction;
        }
        else
        {
            throw new InvalidOperationException(
                $"Standard deduction not found for filing status: {filingStatus}"
            );
        }
    }

    public int CalculateAdjustedGrossIncome()
    {
        if (W2Wages == null)
        {
            throw new InvalidOperationException(
                "W-2 wages must be provided to calculate adjusted gross income."
            );
        }
        if (OrdinaryDividends == null)
        {
            throw new InvalidOperationException(
                "Ordinary dividends must be provided to calculate adjusted gross income."
            );
        }
        if (TaxableInterest == null)
        {
            throw new InvalidOperationException(
                "Taxable interest must be provided to calculate adjusted gross income."
            );
        }
        return (W2Wages ?? 0) + (OrdinaryDividends ?? 0) + (TaxableInterest ?? 0);
    }

    public int CalculateTaxableIncome()
    {
        return Math.Max(0, AdjustedGrossIncome - StandardDeduction);
    }

    public int CalculateTax(int? taxFromTaxTable, TaxResponse[] taxResponses)
    {
        // TODO: there are a bunch of cases that this doesn't handle yet, like schedule D, form 8615, foreign income tax, etc.

        if (taxFromTaxTable == null)
        {
            throw new InvalidOperationException(
                "Tax from tax table is required to calculate total tax."
            );
        }

        // Determine if we must use the qualified dividends and capital gains worksheet

        // if (QualifiedDividends > 0 || )
        // {

        // }
        return taxFromTaxTable.Value;
    }

    public bool SetIncomeSources(TaxResponse[] responses)
    {
        var w2Wages = TaxResponse.GetResponseValue(
            [.. responses],
            TaxForm.Form1040,
            TaxFieldLabel.oneA
        );
        if (!TaxResponse.TryParseCurrency(w2Wages, out int w2WagesNumber))
        {
            return false;
        }

        var qualifiedDividends = TaxResponse.GetResponseValue(
            [.. responses],
            TaxForm.Form1040,
            TaxFieldLabel.threeA
        );
        if (!TaxResponse.TryParseCurrency(qualifiedDividends, out int qualifiedDividendsNumber))
        {
            qualifiedDividendsNumber = 0; // Treat invalid or missing qualified dividends as zero
        }

        var ordinaryDividends = TaxResponse.GetResponseValue(
            [.. responses],
            TaxForm.Form1040,
            TaxFieldLabel.threeB
        );
        if (!TaxResponse.TryParseCurrency(ordinaryDividends, out int ordinaryDividendsNumber))
        {
            ordinaryDividendsNumber = 0; // Treat invalid or missing dividends as zero
        }

        var taxableInterest = TaxResponse.GetResponseValue(
            [.. responses],
            TaxForm.Form1040,
            TaxFieldLabel.twoB
        );
        if (!TaxResponse.TryParseCurrency(taxableInterest, out int taxableInterestNumber))
            if (!TaxResponse.TryParseCurrency(taxableInterest, out taxableInterestNumber))
            {
                taxableInterestNumber = 0; // Treat invalid or missing taxable interest as zero
            }

        W2Wages = w2WagesNumber;
        QualifiedDividends = qualifiedDividendsNumber;
        OrdinaryDividends = ordinaryDividendsNumber;
        TaxableInterest = taxableInterestNumber;
        return true;
    }
}
