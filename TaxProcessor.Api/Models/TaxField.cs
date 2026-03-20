using System.Text.Json.Serialization;
using TaxProcessor.Api.Data;

namespace TaxProcessor.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum FieldCalculationCallback
{
    [JsonPropertyName("standardDeduction")]
    StandardDeduction,
}

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
    [JsonPropertyName("form")]
    public required TaxForm Form { get; set; }

    [JsonPropertyName("taxFieldLabel")]
    public required TaxFieldLabel? TaxFieldLabel { get; set; }

    [JsonPropertyName("label")]
    public string Label { get; set; } = null!;

    [JsonPropertyName("type")]
    public required TaxFieldType Type { get; set; }

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
