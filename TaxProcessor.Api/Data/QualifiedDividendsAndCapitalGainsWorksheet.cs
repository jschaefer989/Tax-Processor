using TaxProcessor.Api.Controllers;
using TaxProcessor.Api.Models;

namespace TaxProcessor.Api.Data;

public class QualifiedDividendsAndCapitalGainsWorksheet(
    FilingStatus filingStatus,
    int qualifiedDividends,
    int taxableIncome,
    int? netLongTermCapitalGains,
    int? scheduleD16,
    QualifiedDividendsThresholdFetcher thresholdsFetcher,
    TaxCalculator taxCalculator
)
{
    private readonly FilingStatus _filingStatus = filingStatus;
    private readonly int _qualifiedDividends = qualifiedDividends;
    private readonly int _taxableIncome = taxableIncome;
    private readonly int? _netLongTermCapitalGains = netLongTermCapitalGains;
    private readonly int? _scheduleD16 = scheduleD16;
    private readonly QualifiedDividendsThresholdFetcher _thresholdsFetcher = thresholdsFetcher;
    private readonly TaxCalculator _taxCalculator = taxCalculator;

    public async Task<int> CalculateTaxAsync(TaxResponse[] responses)
    {
        var capitalGains = DetermineCapitalGains(responses);
        var thresholds = await _thresholdsFetcher.GetThresholdsAsync();

        var line4 = _qualifiedDividends + capitalGains;
        var line5 = Math.Max(_taxableIncome - line4, 0);;
        var line6 = thresholds.GetZeroRateThreshold(_filingStatus);
        var line7 = Math.Min(_taxableIncome, line6);
        var line8 = Math.Min(line5, line7);
        var line9 = line7 - line8;
        var line10 = Math.Min(_taxableIncome, line4);
        var line12 = Math.Max(line10 - line9, 0);
        var line13 = thresholds.GetFifteenRateUpperThreshold(_filingStatus);
        var line14 = Math.Min(_taxableIncome, line13);        
        var line15 = line5 + line9;        
        var line16 = Math.Max(line14 - line15, 0);
        var line17 = Math.Min(line12, line16);
        var line18 = (int)Math.Round(line17 * thresholds.MiddleBracketRate, MidpointRounding.AwayFromZero);
        var line19 = line9 + line17;
        var line20 = Math.Max(line10 - line19, 0);
        var line21 = (int)Math.Round(line20 * thresholds.TopBracketRate, MidpointRounding.AwayFromZero);
        var line22 = await _taxCalculator.CalculateTax(_filingStatus, line5);
        var line23 = line18 + line21 + line22;        
        var line24 = await _taxCalculator.CalculateTax(_filingStatus, _taxableIncome);

        return Math.Min(line23, line24);
    }

    private int DetermineCapitalGains(TaxResponse[] responses)
    {
        if ((_netLongTermCapitalGains ?? 0) != 0 || (_scheduleD16 ?? 0) != 0)
        {
            return Math.Min(_netLongTermCapitalGains ?? 0, _scheduleD16 ?? 0);
        }

        var sevenA = TaxResponse.GetResponseValue([.. responses], TaxForm.Form1040, TaxFieldLabel.sevenA);
        if (!TaxResponse.TryParseCurrency(sevenA, out var sevenANumber))
        {
            throw new Exception(
                "Expected Schedule D line 16 or Form 1040 line 7a to be present and parseable for qualified dividends and capital gains tax calculation."
            );
        }

        return sevenANumber;
    }
}