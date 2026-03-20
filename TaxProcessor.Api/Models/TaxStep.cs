using System.Text.Json.Serialization;

namespace TaxProcessor.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Steps
{
    [JsonPropertyName("demographics")]
    Demographics,
    [JsonPropertyName("income")]
    Income,
    [JsonPropertyName("taxAndCredits")]
    TaxAndCredits,
    [JsonPropertyName("paymentsAndRefundableCredits")]
    PaymentsAndRefundableCredits,
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
    public List<TaxField> Fields { get; set; } = [];

    [JsonPropertyName("files")]
    public List<TaxFile> Files { get; set; } = [];

    static public string GetStepValue(Steps step)
    {
        return step switch
        {
            Steps.Demographics => "demographics",
            Steps.Income => "income",
            Steps.TaxAndCredits => "taxAndCredits",
            Steps.PaymentsAndRefundableCredits => "paymentsAndRefundableCredits",
            _ => throw new ArgumentOutOfRangeException(nameof(step), step, null),
        };
    }
}
