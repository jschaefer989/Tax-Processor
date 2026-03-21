using System.Text.RegularExpressions;
using System.Linq;
using HtmlAgilityPack;
using Microsoft.Extensions.Caching.Memory;

namespace TaxProcessor.Api.Data;

public partial class QualifiedDividendsThresholdFetcher(
    IHttpClientFactory httpClientFactory,
    IMemoryCache cache
)
{
    private const string CacheKeyPrefix = "irsQualifiedDividendsThresholds";
    private const string IrsTopicUrl = "https://www.irs.gov/taxtopics/tc409";

    public async Task<QualifiedDividendsThresholds> GetThresholdsAsync()
    {
        var client = httpClientFactory.CreateClient();
        var html = await client.GetStringAsync(IrsTopicUrl);
        var parsed = ParseThresholds(html);

        var cacheKey = $"{CacheKeyPrefix}:{parsed.TaxYear}";
        cache.Set(cacheKey, parsed, TimeSpan.FromDays(1));
        return parsed;
    }

    private static QualifiedDividendsThresholds ParseThresholds(string html)
    {
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var text = HtmlEntity.DeEntitize(doc.DocumentNode.InnerText);
        text = MultiWhitespaceRegex().Replace(text, " ");

        var yearMatch = TaxYearRegex().Match(text);
        if (!yearMatch.Success)
        {
            throw new Exception("Unable to determine tax year from IRS topic page for capital gains rates.");
        }

        if (!int.TryParse(yearMatch.Groups[1].Value, out var taxYear))
        {
            throw new Exception("Unable to parse tax year from IRS topic page for capital gains rates.");
        }

        var orderedRates = ExtractOrderedRates(text);
        var zeroRate = orderedRates[0];
        var middleRate = orderedRates[1];
        var topRate = orderedRates[2];

        var zeroSingle = ExtractAmount(
            text,
            ZeroRateSingleOrMfsRegex(),
            "0% threshold for single/married filing separately"
        );
        var zeroMfj = ExtractAmount(
            text,
            ZeroRateMfjRegex(),
            "0% threshold for married filing jointly/qualifying surviving spouse"
        );
        var zeroHoh = ExtractAmount(
            text,
            ZeroRateHohRegex(),
            "0% threshold for head of household"
        );

        var fifteenSection = ExtractFifteenRateSection(text);

        var fifteenSingle = ExtractAmount(
            fifteenSection,
            FifteenRateSingleUpperRegex(),
            "15% upper threshold for single"
        );
        var fifteenMfs = ExtractAmount(
            fifteenSection,
            FifteenRateMfsUpperRegex(),
            "15% upper threshold for married filing separately"
        );
        var fifteenMfj = ExtractAmount(
            fifteenSection,
            FifteenRateMfjUpperRegex(),
            "15% upper threshold for married filing jointly/qualifying surviving spouse"
        );
        var fifteenHoh = ExtractAmount(
            fifteenSection,
            FifteenRateHohUpperRegex(),
            "15% upper threshold for head of household"
        );

        if (
            zeroRate < 0m
            || middleRate <= zeroRate
            || topRate <= middleRate
            || zeroSingle <= 0
            || zeroMfj <= 0
            || zeroHoh <= 0
            || fifteenSingle <= zeroSingle
            || fifteenMfs <= zeroSingle
            || fifteenMfj <= zeroMfj
            || fifteenHoh <= zeroHoh
        )
        {
            throw new Exception(
                "IRS capital gains thresholds failed validation (expected strictly increasing 0% and 15% bounds)."
            );
        }

        return new QualifiedDividendsThresholds
        {
            TaxYear = taxYear,
            ZeroBracketRate = zeroRate,
            MiddleBracketRate = middleRate,
            TopBracketRate = topRate,
            ZeroRateSingleOrMfs = zeroSingle,
            ZeroRateMarriedJointlyOrSurvivingSpouse = zeroMfj,
            ZeroRateHeadOfHousehold = zeroHoh,
            FifteenRateSingleUpper = fifteenSingle,
            FifteenRateMarriedSeparatelyUpper = fifteenMfs,
            FifteenRateMarriedJointlyOrSurvivingSpouseUpper = fifteenMfj,
            FifteenRateHeadOfHouseholdUpper = fifteenHoh,
        };
    }

    private static int ExtractAmount(string source, Regex regex, string label)
    {
        var match = regex.Match(source);
        if (!match.Success)
        {
            throw new Exception($"Unable to find {label} from IRS topic page.");
        }

        var amountToken = AmountCleanupRegex().Replace(match.Groups[1].Value, "");
        if (!int.TryParse(amountToken, out var amount) || amount <= 0)
        {
            throw new Exception($"Unable to parse {label} from IRS topic page.");
        }

        return amount;
    }

    private static decimal ExtractRate(string source, Regex regex, string label)
    {
        var match = regex.Match(source);
        if (!match.Success)
        {
            throw new Exception($"Unable to find {label} from IRS topic page.");
        }

        if (!decimal.TryParse(match.Groups[1].Value, out var percent))
        {
            throw new Exception($"Unable to parse {label} from IRS topic page.");
        }

        return percent / 100m;
    }

    private static List<decimal> ExtractOrderedRates(string source)
    {
        var matches = CapitalGainsRateRegex().Matches(source);
        var orderedDistinctRates = new List<decimal>();

        foreach (Match match in matches)
        {
            if (!decimal.TryParse(match.Groups[1].Value, out var percent))
            {
                continue;
            }

            var rate = percent / 100m;
            if (!orderedDistinctRates.Contains(rate))
            {
                orderedDistinctRates.Add(rate);
            }
        }

        if (orderedDistinctRates.Count < 3)
        {
            throw new Exception(
                "Unable to find ordered capital gains rates (0%, middle, top) from IRS topic page."
            );
        }

        return orderedDistinctRates;
    }

    private static string ExtractFifteenRateSection(string source)
    {
        var startMatch = FifteenSectionStartRegex().Match(source);
        if (!startMatch.Success)
        {
            throw new Exception("Unable to find 15% capital gains threshold section from IRS topic page.");
        }

        var startIndex = startMatch.Index;
        var endMatch = FifteenSectionEndRegex().Match(source, startIndex);
        if (!endMatch.Success || endMatch.Index <= startIndex)
        {
            return source[startIndex..];
        }

        return source[startIndex..endMatch.Index];
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex MultiWhitespaceRegex();

    [GeneratedRegex(@"For taxable years beginning in\s+(\d{4})", RegexOptions.IgnoreCase)]
    private static partial Regex TaxYearRegex();

    [GeneratedRegex(@"capital gains rate of\s*([0-9]+)%", RegexOptions.IgnoreCase)]
    private static partial Regex CapitalGainsRateRegex();

    [GeneratedRegex(
        @"A capital gains rate of\s*([0-9]+)%\s+applies if your taxable income is less than or equal to",
        RegexOptions.IgnoreCase
    )]
    private static partial Regex ZeroRateRegex();

    [GeneratedRegex(
        @"A capital gains rate of\s*([0-9]+)%\s+applies if your taxable income is:\s*\u2022",
        RegexOptions.IgnoreCase
    )]
    private static partial Regex MiddleRateRegex();

    [GeneratedRegex(
        @"A capital gains rate of\s*[0-9]+%\s+applies if your taxable income is:",
        RegexOptions.IgnoreCase
    )]
    private static partial Regex FifteenSectionStartRegex();

    [GeneratedRegex(@"However,\s+a capital gains rate of", RegexOptions.IgnoreCase)]
    private static partial Regex FifteenSectionEndRegex();

    [GeneratedRegex(
        @"However, a capital gains rate of\s*([0-9]+)%\s+applies to the extent",
        RegexOptions.IgnoreCase
    )]
    private static partial Regex TopRateRegex();

    [GeneratedRegex(
        @"\$([0-9,]+)\s+for\s+single\s+and\s+married\s+filing\s+separately",
        RegexOptions.IgnoreCase
    )]
    private static partial Regex ZeroRateSingleOrMfsRegex();

    [GeneratedRegex(
        @"\$([0-9,]+)\s+for\s+married\s+filing\s+jointly\s+and\s+qualifying\s+surviving\s+spouse",
        RegexOptions.IgnoreCase
    )]
    private static partial Regex ZeroRateMfjRegex();

    [GeneratedRegex(@"\$([0-9,]+)\s+for\s+head\s+of\s+household", RegexOptions.IgnoreCase)]
    private static partial Regex ZeroRateHohRegex();

    [GeneratedRegex(
        @"more\s+than\s+\$[0-9,]+\s+but\s+less\s+than\s+or\s+equal\s+to\s+\$([0-9,]+)\s+for\s+single\b",
        RegexOptions.IgnoreCase
    )]
    private static partial Regex FifteenRateSingleUpperRegex();

    [GeneratedRegex(
        @"more\s+than\s+\$[0-9,]+\s+but\s+less\s+than\s+or\s+equal\s+to\s+\$([0-9,]+)\s+for\s+married\s+filing\s+separately\b",
        RegexOptions.IgnoreCase
    )]
    private static partial Regex FifteenRateMfsUpperRegex();

    [GeneratedRegex(
        @"more\s+than\s+\$[0-9,]+\s+but\s+less\s+than\s+or\s+equal\s+to\s+\$([0-9,]+)\s+for\s+married\s+filing\s+jointly\s+and\s+qualifying\s+surviving\s+spouse",
        RegexOptions.IgnoreCase
    )]
    private static partial Regex FifteenRateMfjUpperRegex();
    
    [GeneratedRegex(
        @"more\s+than\s+\$[0-9,]+\s+but\s+less\s+than\s+or\s+equal\s+to\s+\$([0-9,]+)\s+for\s+head\s+of\s+household",
        RegexOptions.IgnoreCase
    )]
    private static partial Regex FifteenRateHohUpperRegex();

    [GeneratedRegex("[^0-9]")]
    private static partial Regex AmountCleanupRegex();
}
