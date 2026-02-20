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

public class TaxField
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = null!;

    [JsonPropertyName("label")]
    public string Label { get; set; } = null!;

    [JsonPropertyName("type")]
    public TaxFieldType Type { get; set; }

    [JsonPropertyName("selectionOptions")]
    public List<string>? SelectionOptions { get; set; }

    [JsonPropertyName("helperText")]
    public string? HelperText { get; set; }
}

public class TaxStep
{
    [JsonPropertyName("step")]
    public string Step { get; set; } = null!;

    [JsonPropertyName("title")]
    public string Title { get; set; } = null!;

    [JsonPropertyName("description")]
    public string Description { get; set; } = null!;

    [JsonPropertyName("fields")]
    public List<TaxField> Fields { get; set; } = new();
}
