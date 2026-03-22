using System.Text.RegularExpressions;
using HtmlAgilityPack;
using Microsoft.Extensions.Caching.Memory;
using TaxProcessor.Api.Controllers;

namespace TaxProcessor.Api.Data;

public partial class StandardDeductionFetcher(
    IHttpClientFactory httpClientFactory,
    IMemoryCache cache
)
{
    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
    private readonly IMemoryCache _cache = cache;

    private const string CacheKey = "irsStandardDeductions";
    private const string IrsUrl = "https://www.irs.gov/publications/p501";

    // Hardcoded fallback values — used if the IRS page is unreachable or unparseable.
    private static readonly Dictionary<FilingStatus, int> FallbackValues = new()
    {
        [FilingStatus.Single] = 15750,
        [FilingStatus.MarriedFilingJointly] = 31500,
        [FilingStatus.MarriedFilingSeparately] = 15750,
        [FilingStatus.HeadOfHousehold] = 23625,
        [FilingStatus.QualifyingWidow] = 31500,
    };

    public async Task<Dictionary<FilingStatus, int>> GetStandardDeductionsAsync()
    {
        if (
            _cache.TryGetValue(CacheKey, out Dictionary<FilingStatus, int>? cached)
            && cached != null
        )
        {
            return cached;
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            var html = await client.GetStringAsync(IrsUrl);
            var parsed = ParseStandardDeductionTable(html);
            if (parsed.Count == Enum.GetValues<FilingStatus>().Length)
            {
                _cache.Set(CacheKey, parsed, TimeSpan.FromDays(1));
                return parsed;
            }
        }
        catch (Exception ex)
        {
            // Log the exception (not implemented here) and fall back to hardcoded values.
            throw new Exception($"Error fetching/parsing standard deductions: {ex.Message}");
        }

        return FallbackValues;
    }

    private static Dictionary<FilingStatus, int> ParseStandardDeductionTable(string html)
    {
        var result = new Dictionary<FilingStatus, int>();
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        // Find Table 6 — the standard deduction chart.
        // It contains "Single or Married filing separately" (unlike Table 1 which uses
        // lowercase "single" combined with "under 65").
        var targetTable = doc
            .DocumentNode.SelectNodes("//table")
            ?.FirstOrDefault(table =>
            {
                var text = table.InnerText;
                return text.Contains(
                        "Single or Married filing separately",
                        StringComparison.OrdinalIgnoreCase
                    )
                    && text.Contains("Married filing jointly", StringComparison.OrdinalIgnoreCase)
                    && text.Contains("Head of household", StringComparison.OrdinalIgnoreCase)
                    && !text.Contains("under 65", StringComparison.OrdinalIgnoreCase);
            });

        if (targetTable is null)
        {
            throw new Exception("Could not find standard deduction table in IRS HTML.");
        }

        var rows = targetTable.SelectNodes(".//tr");
        if (rows is null)
        {
            throw new Exception("Standard deduction table has no rows.");
        }

        foreach (var row in rows)
        {
            var cells = row.SelectNodes(".//td");
            if (cells is null || cells.Count < 2)
            {
                continue;
            }

            var statusText = HtmlEntity.DeEntitize(cells[0].InnerText).Trim();
            var amountText = HtmlEntity.DeEntitize(cells[1].InnerText).Trim();

            // Strip everything except digits to parse the dollar amount (handles "$15,750", "31,500").
            var digitsOnly = DigitsRegex().Replace(amountText, "");
            if (!int.TryParse(digitsOnly, out var amount) || amount == 0)
            {
                continue;
            }

            if (statusText.Contains("Single", StringComparison.OrdinalIgnoreCase))
            {
                result[FilingStatus.Single] = amount;
            }

            if (
                statusText.Contains("Married filing separately", StringComparison.OrdinalIgnoreCase)
            )
            {
                result[FilingStatus.MarriedFilingSeparately] = amount;
            }

            if (statusText.Contains("Married filing jointly", StringComparison.OrdinalIgnoreCase))
            {
                result[FilingStatus.MarriedFilingJointly] = amount;
            }

            if (
                statusText.Contains(
                    "Qualifying surviving spouse",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                result[FilingStatus.QualifyingWidow] = amount;
            }

            if (statusText.Contains("Head of household", StringComparison.OrdinalIgnoreCase))
            {
                result[FilingStatus.HeadOfHousehold] = amount;
            }
        }

        return result;
    }

    [GeneratedRegex(@"[^\d]")]
    private static partial Regex DigitsRegex();
}
