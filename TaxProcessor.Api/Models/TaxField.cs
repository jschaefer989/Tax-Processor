using System.Text.Json.Serialization;
using TaxProcessor.Api.Data;

namespace TaxProcessor.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum FieldCalculationCallback
{
    [JsonPropertyName("standardDeduction")]
    StandardDeduction,
}

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
    public List<SelectionOption>? SelectionOptions { get; set; }

    [JsonPropertyName("helperText")]
    public string? HelperText { get; set; }

    [JsonPropertyName("subsection")]
    public string? Subsection { get; set; }

    [JsonPropertyName("isRequired")]
    public bool IsRequired { get; set; } = false;

    /// <summary>
    /// Not currently used, but keeping around in case there is a need for the frontend to trigger 
    /// a calculation for a specific field (e.g., standard deduction) and we want to have 
    /// a strongly typed way to identify which calculation to perform.
    /// </summary>
    [JsonPropertyName("calculationCallback")]
    public FieldCalculationCallback? CalculationCallback { get; set; }
}
