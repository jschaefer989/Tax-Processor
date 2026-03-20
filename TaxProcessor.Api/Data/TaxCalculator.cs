using TaxProcessor.Api.Controllers;

namespace TaxProcessor.Api.Data;

public class TaxCalculator(decimal? w2Wages, decimal? ordinaryDividends, FilingStatus filingStatus)
{
    public decimal? OrdinaryDividends { get; set; } = ordinaryDividends;
    public decimal? StandardDeduction { get; set; } = GetStandardDeductionAmount(filingStatus);

    public decimal? W2Wages { get; set; } = w2Wages;

    public decimal CalculateTaxableIncome()
    {
        return Math.Max(0, (W2Wages ?? 0) + (OrdinaryDividends ?? 0) - (StandardDeduction ?? 0));
    }

    public static decimal GetStandardDeductionAmount(FilingStatus option)
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
}