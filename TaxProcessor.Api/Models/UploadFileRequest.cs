namespace TaxProcessor.Api.Models;

using System.Text.Json.Serialization;

public class UploadFileRequest
{
    public required string Form { get; set; }
    public required IFormFile File { get; set; }
}
