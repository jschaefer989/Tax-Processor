using TaxProcessor.Api.Controllers;

namespace TaxProcessor.Api.Data;

public class TaxCalculator(
    StandardDeductionFetcher standardDeductionFetcher,
    FilingStatus filingStatus
)
{
    public int StandardDeduction =>
        DetermineStandardDeductionAsync(filingStatus).GetAwaiter().GetResult();
    public int? OrdinaryDividends { get; set; }
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
}
