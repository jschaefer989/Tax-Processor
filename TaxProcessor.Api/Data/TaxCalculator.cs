using TaxProcessor.Api.Controllers;
using TaxProcessor.Api.Models;

namespace TaxProcessor.Api.Data;

public class TaxCalculator(
    StandardDeductionFetcher standardDeductionFetcher,
    QualifiedDividendsThresholdFetcher qualifiedDividendsThresholdFetcher,
    TaxTableFetcher taxTableFetcher,
    FilingStatus filingStatus
)
{
    public int StandardDeduction =>
        DetermineStandardDeductionAsync(filingStatus).GetAwaiter().GetResult();
    public int? OrdinaryDividends { get; set; }
    public int? QualifiedDividends { get; set; }
    public int? TaxableInterest { get; set; }

    public int? W2Wages { get; set; }

    public int? CapitalGains { get; set; }

    public int? NetLongTermCapitalGains { get; set; }

    public int? ScheduleD16 { get; set; }

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
        return (W2Wages ?? 0) + (OrdinaryDividends ?? 0) + (TaxableInterest ?? 0) + (CapitalGains ?? 0);
    }

    public int CalculateTaxableIncome()
    {
        return Math.Max(0, AdjustedGrossIncome - StandardDeduction);
    }

    public async Task<int> CalculateTaxAsync(TaxResponse[] taxResponses)
    {
        // TODO: there are a bunch of cases that this doesn't handle yet, like schedule D, form 8615, foreign income tax, etc.

        // Determine if we must use the qualified dividends and capital gains worksheet
        if (QualifiedDividends > 0 || (NetLongTermCapitalGains ?? 0) > 0 || (ScheduleD16 ?? 0) > 0)
        {
            var worksheet = new QualifiedDividendsAndCapitalGainsWorksheet(
                filingStatus,
                QualifiedDividends ?? 0,
                TaxableIncome,
                NetLongTermCapitalGains,
                ScheduleD16,
                qualifiedDividendsThresholdFetcher,
                this
            );            
            return await worksheet.CalculateTaxAsync(taxResponses);
        }

        var taxFromTaxTable = await CalculateTax(filingStatus, TaxableIncome);
        return taxFromTaxTable;
    }

    public async Task<int> CalculateTax(FilingStatus filingStatus, int amount)
    {   
        if (amount < 0)
        {
            throw new InvalidOperationException("Amount for tax calculation cannot be negative.");
        }
        if (amount < 100000)
        {
            var taxFromTaxTable = await taxTableFetcher.GetTaxTableAsync(filingStatus, amount);
            return taxFromTaxTable ?? throw new InvalidOperationException("Tax from tax table is required to calculate total tax.");
        }
        throw new InvalidOperationException("Tax calculation for amounts $100,000 or greater is not supported yet. Please submit a feature request.");
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
        {
            taxableInterestNumber = 0; // Treat invalid or missing taxable interest as zero
        }

        var capitalGains = TaxResponse.GetResponseValue(
            [.. responses],
            TaxForm.Form1040,
            TaxFieldLabel.sevenA
        );
        if (!TaxResponse.TryParseCurrency(capitalGains, out int capitalGainsNumber))
        {
            capitalGainsNumber = 0; // Treat invalid or missing capital gains as zero
        }

        var netLongTermCapitalGains = TaxResponse.GetResponseValue(
            [.. responses],
            TaxForm.ScheduleD,
            TaxFieldLabel.fifteen
        );
        if (!TaxResponse.TryParseCurrency(netLongTermCapitalGains, out int netLongTermCapitalGainsNumber))
        {
            netLongTermCapitalGainsNumber = 0; // Treat invalid or missing net long-term capital gains as zero
        }

        var scheduleD16 = TaxResponse.GetResponseValue(
            [.. responses],
            TaxForm.ScheduleD,
            TaxFieldLabel.sixteen
        );
        if (!TaxResponse.TryParseCurrency(scheduleD16, out int scheduleD16Number))
        {
            scheduleD16Number = 0; // Treat invalid or missing Schedule D line 16 as zero
        }

        W2Wages = w2WagesNumber;
        QualifiedDividends = qualifiedDividendsNumber;
        OrdinaryDividends = ordinaryDividendsNumber;
        TaxableInterest = taxableInterestNumber;
        NetLongTermCapitalGains = netLongTermCapitalGainsNumber;
        ScheduleD16 = scheduleD16Number;
        CapitalGains = capitalGainsNumber;
        return true;
    }
}
