using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;

namespace TaxProcessor.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TaxFieldType
{
    [JsonPropertyName("text")]
    Text,

    [JsonPropertyName("number")]
    Number,

    [JsonPropertyName("currency")]
    Currency,

    [JsonPropertyName("date")]
    Date,

    [JsonPropertyName("select")]
    Select,
}

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
    [JsonPropertyName("2e")]
    twoE,
}
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AdditionalIdentifierLabel
{
    [JsonPropertyName("formCode")]
    formCode,
    [JsonPropertyName("subsection")]
    subsection
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

    public TaxResponse()
    {
    }

    [SetsRequiredMembers]
    public TaxResponse(
        TaxForm form,
        TaxFieldLabel label,
        int line,
        string? value,
        string? formCode = null,
        string? subsection = null)
    {
        Form = form;
        Label = label;
        Line = line;
        Value = value;
        FormCode = formCode;
        Subsection = subsection;
    }
}
