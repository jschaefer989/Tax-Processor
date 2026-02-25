public enum Term
{
    Short,
    Long
}

public class Form1099B
{
    public decimal? Proceeds { get; set; }

    public decimal? CostOrOtherBasis { get; set; }

    public string? Description { get; set; }

    public DateTime? DateAcquired { get; set; }

    public DateTime? DateSold { get; set; }

    public Term Term { get; set; }

    public char? Form8949Code { get; set; }
}