using HtmlAgilityPack;
using Microsoft.Extensions.Caching.Memory;
using TaxProcessor.Api.Controllers;
using TaxProcessor.Api.Models;

namespace TaxProcessor.Api.Data;

public partial class TaxTableFetcher(IHttpClientFactory httpClientFactory, IMemoryCache cache)
{

    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
    private readonly IMemoryCache _cache = cache;
    private const string CacheKey = "irsTaxTable";
    private const string IrsUrl = "https://www.irs.gov/publications/p1040#d0e40925";

    public async Task<int?> GetTaxTableAsync(FilingStatus filingStatus, int taxableIncome)
    {
        var cacheKey = $"{CacheKey}:{filingStatus}:{taxableIncome}";
        if (_cache.TryGetValue(cacheKey, out int? cached) && cached != null)
        {
            return cached;
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            var html = await client.GetStringAsync(IrsUrl);
            var parsed = ParseTaxTable(html, filingStatus, taxableIncome);
            _cache.Set(cacheKey, parsed, TimeSpan.FromDays(1));
            return parsed;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to fetch or parse IRS tax table data: {ex.Message}");
        }
    }

    private static int ParseTaxTable(string html, FilingStatus filingStatus, int taxableIncome)
    {
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        // Find the correct row + column in the tax table based on filing status and taxable income.
        // The IRS page has multiple tables, so we need to find the right one by looking for specific text patterns in the table.
        var targetSection =
            (
                doc
                    .DocumentNode.SelectNodes("//div")
                    ?.FirstOrDefault(div =>
                        div.SelectNodes(".//h4")?.Any(h =>
                            h.InnerText.Contains(
                                "Tax Table",
                                StringComparison.OrdinalIgnoreCase
                            )
                        ) == true
                    )
            ) ?? throw new Exception("Could not find tax table section in IRS HTML.");

        // The IRS Tax Table section contains many sub-tables, one per income range page.
        // Search ALL tables in the section so any income range can be found.
        var tables =
            targetSection.SelectNodes(".//table")
            ?? throw new Exception("Could not find any tables in IRS tax table section.");

        foreach (var table in tables)
        {
            var rows =
                table.SelectNodes(".//tr")
                ?? throw new Exception("Could not find rows in IRS tax table.");

            foreach (var row in rows)
            {
                var cells = row.SelectNodes("./td");
                if (cells == null || cells.Count < 2)
                {
                    continue;
                }

                var cell0 = HtmlEntity.DeEntitize(cells[0].InnerText).Trim();
                var cell1 = HtmlEntity.DeEntitize(cells[1].InnerText).Trim();
                if (
                    !TaxResponse.TryParseCurrency(cell0, out var minIncome)
                    || !TaxResponse.TryParseCurrency(cell1, out var maxIncome)
                )
                {
                    continue;
                }

                if (taxableIncome >= minIncome && taxableIncome < maxIncome)
                {
                    var taxCell = GetCellForFilingStatus(cells, filingStatus);
                    var taxCellText = HtmlEntity.DeEntitize(taxCell.InnerText).Trim();
                    if (!TaxResponse.TryParseCurrency(taxCellText, out var taxAmount))
                    {
                        throw new Exception("Could not parse tax amount from IRS HTML.");
                    }

                    return taxAmount;
                }
            }
        }

        throw new Exception("Could not find matching tax range for the given income.");
    }

    private static HtmlNode GetCellForFilingStatus(
        HtmlNodeCollection cells,
        FilingStatus filingStatus
    )
    {
        // IRS rows are: min income, max income, single, married filing jointly,
        // married filing separately, head of household.
        var index = filingStatus switch
        {
            FilingStatus.Single => 2,
            FilingStatus.MarriedFilingJointly => 3,
            FilingStatus.MarriedFilingSeparately => 4,
            FilingStatus.HeadOfHousehold => 5,
            FilingStatus.QualifyingWidow => 3,
            _ => throw new Exception("Unsupported filing status."),
        };

        if (cells.Count <= index)
        {
            throw new Exception(
                "IRS tax table row does not include expected filing status column."
            );
        }

        return cells[index];
    }
}
