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
}
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AdditionalIdentifierLabel
{
    [JsonPropertyName("formCode")]
    formCode
}
public class TaxResponse
{
    [JsonPropertyName("form")]
    public required TaxForm Form { get; set; }

    [JsonPropertyName("label")]
    public required TaxFieldLabel Label { get; set; }

    [JsonPropertyName("line")]
    public int Line { get; set; }

    [JsonPropertyName("value")]
    public string? Value { get; set; }

    [JsonPropertyName("additionalIdentifiers")]
    public Dictionary<AdditionalIdentifierLabel, string>? AdditionalIdentifiers { get; set; }
}
