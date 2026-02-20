using System.Text.Json.Serialization;

namespace TaxProcessor.Api.Models;

public class TaxResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = null!;

    [JsonPropertyName("value")]
    public string Value { get; set; } = null!;   
}
