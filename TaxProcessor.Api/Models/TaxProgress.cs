using System.Text.Json.Serialization;

namespace TaxProcessor.Api.Models;

public class TaxProgress
{

    [JsonPropertyName("year")]
    public int Year { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [JsonPropertyName("currentStep")]
    public string? CurrentStep { get; set; }

    [JsonPropertyName("responses")]
    public TaxResponse[] Responses { get; set; } = [];
}
