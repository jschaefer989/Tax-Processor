namespace TaxProcessor.Api.Models;

public class CalculateFieldRequest
{
    public required FieldCalculationCallback CalculationCallback { get; set; }
    public required string Value { get; set; }
}
