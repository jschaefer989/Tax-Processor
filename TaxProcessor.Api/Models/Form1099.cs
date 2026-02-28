namespace TaxProcessor.Api.Models;

public class Form1099
{
    public decimal? OrdinaryDividends { get; set; }
    
    public decimal? QualifiedDividends { get; set; }
    
    public decimal? TaxExemptInterest { get; set; }

    public decimal? InterestIncome { get; set; }

    public List<Form1099B> Form1099Bs { get; set; } = new List<Form1099B>();
}