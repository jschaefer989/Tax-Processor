using System.Text.Json.Serialization;

namespace TaxProcessor.Api.Models;

public class TaxButton
{
    [JsonPropertyName("form")]
    public required TaxForm Form { get; set; }

    [JsonPropertyName("taxFieldLabel")]
    public required TaxFieldLabel? TaxFieldLabel { get; set; }

    [JsonPropertyName("label")]
    public string Label { get; set; } = null!;

    [JsonPropertyName("subsection")]
    public string? Subsection { get; set; }

    [JsonPropertyName("calculationCallback")]
    public FieldCalculationCallback CalculationCallback { get; set; }

    [JsonPropertyName("helperText")]
    public string? HelperText { get; set; }
}
