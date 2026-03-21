using Microsoft.EntityFrameworkCore;

namespace TaxProcessor.Api.Data;

[PrimaryKey(nameof(Year), nameof(Name), nameof(Form), nameof(Label), nameof(Line))]
public class TaxResponseEntity
{
    public int Year { get; set; }

    public required string Name { get; set; }

    public required string Form { get; set; }

    public required string Label { get; set; }

    public int Line { get; set; }

    public string? Value { get; set; }

    public string? FormCode { get; set; }
    public string? Subsection { get; set; }

    // Foreign key relationship
    public TaxProgressEntity? TaxProgress { get; set; }
}
