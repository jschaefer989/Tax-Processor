namespace TaxProcessor.Api.Models.Requests;

using System.Text.Json.Serialization;

public class SaveTaxProgressRequest
{
    [JsonPropertyName("year")]
    public int Year { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("currentStep")]
    public string? CurrentStep { get; set; }

    [JsonPropertyName("responses")]
    public TaxResponse[]? Responses { get; set; }
}
