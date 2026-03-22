namespace TaxProcessor.Api.Models.Requests;

public class SaveTaxProgressRequest
{
    public int Year { get; set; }

    public required string Name { get; set; }

    public string? CurrentStep { get; set; }

    public TaxResponse[]? Responses { get; set; }
}
