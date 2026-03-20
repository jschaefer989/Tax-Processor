namespace TaxProcessor.Api.Models.Requests;

public class CalculateFieldRequest
{
    public required FieldCalculationCallback CalculationCallback { get; set; }
    public string? Value { get; set; }
        
    public TaxResponse[]? Responses { get; set; }
}
