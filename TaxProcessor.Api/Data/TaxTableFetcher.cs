using HtmlAgilityPack;
using Microsoft.Extensions.Caching.Memory;
using TaxProcessor.Api.Controllers;
using TaxProcessor.Api.Models;

namespace TaxProcessor.Api.Data;

public partial class TaxTableFetcher(
    IHttpClientFactory httpClientFactory,
    IMemoryCache cache
)
{
    private const string CacheKey = "irsStandardDeductions";
    private const string IrsUrl = "https://www.irs.gov/publications/p1040#d0e40925";

    public async Task<int?> GetTaxTableAsync(FilingStatus filingStatus, int taxableIncome)
    {
        if (
            cache.TryGetValue(CacheKey + filingStatus, out int? cached)
            && cached != null
        )
        {
            return cached;
        }

        try
        {
            var client = httpClientFactory.CreateClient();
            var html = await client.GetStringAsync(IrsUrl);            
            var parsed = ParseTaxTable(html, filingStatus, taxableIncome);            
            cache.Set(CacheKey + filingStatus, parsed, TimeSpan.FromDays(1));
            return parsed;
        }
        catch
        {
            throw new Exception(
                "Failed to fetch or parse standard deduction amounts from the IRS website. Please submit an issue if this persists."
            );
        }
    }

    private static int ParseTaxTable(string html, FilingStatus filingStatus, int taxableIncome)
    {
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        // Find the correct row + column in the tax table based on filing status and taxable income.
        // The IRS page has multiple tables, so we need to find the right one by looking for specific text patterns in the table.
        var targetSection = (doc
            .DocumentNode.SelectNodes("//div")
            ?.FirstOrDefault(div =>
            {
                return div.ChildNodes.FirstOrDefault(childNode => childNode.Name == "h4" && childNode.InnerText.Contains("Tax Table", StringComparison.OrdinalIgnoreCase)) != null;
            })) ?? throw new Exception("Could not find tax table section in IRS HTML.");

        var targetTable = targetSection.SelectNodes(".//table")?.FirstOrDefault() ?? throw new Exception("Could not find tax table in IRS HTML.");
        var rows = targetTable.SelectNodes(".//tr");

        foreach (var row in rows)
        {
            var cells = row.SelectNodes(".//td");
            if (cells == null)
            {
                continue; // Not a valid row
            }

            // The first cell contains the lower bound for the income range, 
            // the second cell contains the upper bound, 
            // and the subsequent cells contain the tax amounts for each filing status.
            if (!TaxResponse.TryParseCurrency(cells[0].InnerText.Trim(), out var minIncome) ||
                !TaxResponse.TryParseCurrency(cells[1].InnerText.Trim(), out var maxIncome))
            {
                continue; // Invalid income range
            }

            if (taxableIncome >= minIncome && taxableIncome <= maxIncome)
            {
                var taxCell = GetCellForFilingStatus(row, filingStatus);
                if (taxCell == null || !TaxResponse.TryParseCurrency(taxCell.InnerText.Trim(), out var taxAmount))
                {
                    throw new Exception("Could not parse tax amount from IRS HTML.");
                }
                return taxAmount;
            }
        }
        throw new Exception("Could not find matching tax range for the given income.");
    }

    private static HtmlNode GetCellForFilingStatus(HtmlNode row, FilingStatus filingStatus)
    {
        return filingStatus switch
        {
            FilingStatus.Single => row.SelectSingleNode(".//td[2]"),
            FilingStatus.MarriedFilingJointly => row.SelectSingleNode(".//td[3]"),
            FilingStatus.MarriedFilingSeparately => row.SelectSingleNode(".//td[4]"),
            FilingStatus.HeadOfHousehold => row.SelectSingleNode(".//td[5]"),
            _ => throw new Exception("Unsupported filing status."),
        };
    }
}