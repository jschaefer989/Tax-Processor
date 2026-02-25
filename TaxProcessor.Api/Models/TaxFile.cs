using System.Text.Json.Serialization;

namespace TaxProcessor.Api.Models;

public enum ReadableForm
{
    Form1099,
    Form1099DIV,
    Form1099INT,
    Form1099B
}

public class TaxFile
{
    [JsonPropertyName("fromForm")]
    public required string FromForm { get; set; }

    [JsonPropertyName("toForm")]
    public required string ToForm { get; set; }

    [JsonPropertyName("label")]
    public string Label { get; set; } = null!;
}