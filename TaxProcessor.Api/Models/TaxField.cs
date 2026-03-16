using System.Text.Json.Serialization;

namespace TaxProcessor.Api.Models;

public class TaxField
{
    [JsonPropertyName("form")]
    public required string Form { get; set; }

    [JsonPropertyName("taxFieldLabel")]
    public required string? TaxFieldLabel { get; set; }

    [JsonPropertyName("label")]
    public string Label { get; set; } = null!;

    [JsonPropertyName("type")]
    public required string Type { get; set; }

    [JsonPropertyName("selectionOptions")]
    public List<string>? SelectionOptions { get; set; }

    [JsonPropertyName("helperText")]
    public string? HelperText { get; set; }
    [JsonPropertyName("subsection")]
    public string? Subsection { get; set; }
}
