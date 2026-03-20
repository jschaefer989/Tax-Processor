namespace TaxProcessor.Api.Models.Requests;

public class CalculateFieldRequest
{
    public required FieldCalculationCallback CalculationCallback { get; set; }
        
    public TaxResponse[]? Responses { get; set; }
}
