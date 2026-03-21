using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Text.Json.Serialization;

namespace TaxProcessor.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TaxForm
{
    [JsonPropertyName("Form1040")]
    Form1040,

    [JsonPropertyName("Form8949Page1")]
    Form8949Page1,

    [JsonPropertyName("Form8949Page2")]
    Form8949Page2,

    [JsonPropertyName("ScheduleD")]
    ScheduleD,
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TaxFieldLabel
{
    [JsonPropertyName("1a")]
    oneA,

    [JsonPropertyName("1b")]
    oneB,

    [JsonPropertyName("1c")]
    oneC,

    [JsonPropertyName("1d")]
    oneD,

    [JsonPropertyName("1e")]
    oneE,

    [JsonPropertyName("1f")]
    oneF,

    [JsonPropertyName("1g")]
    oneG,

    [JsonPropertyName("2a")]
    twoA,

    [JsonPropertyName("2b")]
    twoB,

    [JsonPropertyName("3a")]
    threeA,

    [JsonPropertyName("3b")]
    threeB,

    [JsonPropertyName("12e")]
    twelveE,

    [JsonPropertyName("16")]
    sixteen,

    [JsonPropertyName("filingStatus")]
    FilingStatus,
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AdditionalIdentifierLabel
{
    [JsonPropertyName("formCode")]
    formCode,

    [JsonPropertyName("subsection")]
    subsection,
}

public class TaxResponse
{
    [JsonPropertyName("form")]
    public TaxForm Form { get; set; }

    [JsonPropertyName("label")]
    public TaxFieldLabel Label { get; set; }

    [JsonPropertyName("line")]
    public int Line { get; set; }

    [JsonPropertyName("value")]
    public string? Value { get; set; }

    [JsonPropertyName("formCode")]
    public string? FormCode { get; set; }

    [JsonPropertyName("subsection")]
    public string? Subsection { get; set; }

    public TaxResponse() { }

    [SetsRequiredMembers]
    public TaxResponse(
        TaxForm form,
        TaxFieldLabel label,
        int line,
        string? value,
        string? formCode = null,
        string? subsection = null
    )
    {
        Form = form;
        Label = label;
        Line = line;
        Value = value;
        FormCode = formCode;
        Subsection = subsection;
    }

    public static string? GetResponseValue(
        List<TaxResponse> responses,
        TaxForm form,
        TaxFieldLabel label
    )
    {
        return responses
            .FirstOrDefault(response => response.Form == form && response.Label == label)
            ?.Value;
    }

    public static bool TryParseCurrency(string? value, out int parsed)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            parsed = 0;
            return false;
        }

        if (
            decimal.TryParse(
                value,
                NumberStyles.Currency,
                CultureInfo.CurrentCulture,
                out decimal decimalValue
            )
            || decimal.TryParse(
                value,
                NumberStyles.Currency,
                CultureInfo.InvariantCulture,
                out decimalValue
            )
        )
        {
            parsed = (int)Math.Round(decimalValue, MidpointRounding.AwayFromZero);
            return true;
        }

        parsed = 0;
        return false;
    }
}
