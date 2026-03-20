using TaxProcessor.Api.Controllers;

namespace TaxProcessor.Api.Data;

public class TaxCalculator(FilingStatus filingStatus)
{
    public int StandardDeduction { get; set; } = GetStandardDeductionAmount(filingStatus);
    public int? OrdinaryDividends { get; set; }
    public int? TaxableInterest { get; set; }

    public int? W2Wages { get; set; }

    public int AdjustedGrossIncome => CalculateAdjustedGrossIncome();

    public int TaxableIncome => CalculateTaxableIncome();


    public int CalculateAdjustedGrossIncome()
    {
        if (W2Wages == null)
        {
            throw new InvalidOperationException("W-2 wages must be provided to calculate adjusted gross income.");
        }
        if (OrdinaryDividends == null)
        {
            throw new InvalidOperationException("Ordinary dividends must be provided to calculate adjusted gross income.");
        }
        if (TaxableInterest == null)
        {
            throw new InvalidOperationException("Taxable interest must be provided to calculate adjusted gross income.");
        }
        return (W2Wages ?? 0) + (OrdinaryDividends ?? 0) + (TaxableInterest ?? 0);
    }

    public int CalculateTaxableIncome()
    {
        return Math.Max(0, AdjustedGrossIncome - StandardDeduction);
    }

    public static int GetStandardDeductionAmount(FilingStatus option)
    {
        return option switch
        {
            FilingStatus.Single => 15750,
            FilingStatus.MarriedFilingJointly => 31500,
            FilingStatus.MarriedFilingSeparately => 15750,
            FilingStatus.HeadOfHousehold => 23625,
            FilingStatus.QualifyingWidow => 31500,
            _ => 0,
        };
    }
}