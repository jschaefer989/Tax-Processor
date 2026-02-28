namespace TaxProcessor.Api.Models;

public class UploadFileRequest
{
    public required string Form { get; set; }
    public required IFormFile File { get; set; }
}
