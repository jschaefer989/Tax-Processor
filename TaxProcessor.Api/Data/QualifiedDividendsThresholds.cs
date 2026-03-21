using TaxProcessor.Api.Controllers;

namespace TaxProcessor.Api.Data;

public sealed class QualifiedDividendsThresholds
{
    public required int TaxYear { get; init; }
    public required decimal ZeroBracketRate { get; init; }
    public required decimal MiddleBracketRate { get; init; }
    public required decimal TopBracketRate { get; init; }
    public required int ZeroRateSingleOrMfs { get; init; }
    public required int ZeroRateMarriedJointlyOrSurvivingSpouse { get; init; }
    public required int ZeroRateHeadOfHousehold { get; init; }
    public required int FifteenRateSingleUpper { get; init; }
    public required int FifteenRateMarriedSeparatelyUpper { get; init; }
    public required int FifteenRateMarriedJointlyOrSurvivingSpouseUpper { get; init; }
    public required int FifteenRateHeadOfHouseholdUpper { get; init; }

    public int GetZeroRateThreshold(FilingStatus filingStatus)
    {
        return filingStatus switch
        {
            FilingStatus.Single => ZeroRateSingleOrMfs,
            FilingStatus.MarriedFilingSeparately => ZeroRateSingleOrMfs,
            FilingStatus.MarriedFilingJointly => ZeroRateMarriedJointlyOrSurvivingSpouse,
            FilingStatus.QualifyingWidow => ZeroRateMarriedJointlyOrSurvivingSpouse,
            FilingStatus.HeadOfHousehold => ZeroRateHeadOfHousehold,
            _ => throw new InvalidOperationException($"Unsupported filing status: {filingStatus}"),
        };
    }

    public int GetFifteenRateUpperThreshold(FilingStatus filingStatus)
    {
        return filingStatus switch
        {
            FilingStatus.Single => FifteenRateSingleUpper,
            FilingStatus.MarriedFilingSeparately => FifteenRateMarriedSeparatelyUpper,
            FilingStatus.MarriedFilingJointly => FifteenRateMarriedJointlyOrSurvivingSpouseUpper,
            FilingStatus.QualifyingWidow => FifteenRateMarriedJointlyOrSurvivingSpouseUpper,
            FilingStatus.HeadOfHousehold => FifteenRateHeadOfHouseholdUpper,
            _ => throw new InvalidOperationException($"Unsupported filing status: {filingStatus}"),
        };
    }
}
