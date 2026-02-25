using System.Text.Json.Serialization;

namespace TaxProcessor.Api.Models;
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

    [JsonPropertyName("files")]
    public List<TaxFile> Files { get; set; } = new();
}
