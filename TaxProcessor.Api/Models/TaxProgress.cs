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

    [JsonPropertyName("version")]
    public long Version { get; set; }

    [JsonPropertyName("currentStep")]
    public Steps? CurrentStep { get; set; }

    [JsonPropertyName("responses")]
    public TaxResponse[] Responses { get; set; } = [];
}
