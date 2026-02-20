using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using TaxProcessor.Api.Models;

namespace TaxProcessor.Api.Data;

[PrimaryKey(nameof(Year), nameof(Name))]
public class TaxProgressEntity
{   
    public int Year { get; set; }
    
    public required string Name {get; set; }

    public DateTime UpdatedAt { get; set; }

    public string? CurrentStepId { get; set; }

    public TaxResponse[] Responses { get; set; } = Array.Empty<TaxResponse>();
}
