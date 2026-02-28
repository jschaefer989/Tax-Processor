using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using TaxProcessor.Api.Models;

namespace TaxProcessor.Api.Data;

[PrimaryKey(nameof(Year), nameof(Name))]
public class TaxProgressEntity
{
    public int Year { get; set; }

    public required string Name { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string? CurrentStepId { get; set; }

    public ICollection<TaxResponseEntity> Responses { get; set; } = new List<TaxResponseEntity>();

    public TaxResponse[] GetResponses()
    {
        return Responses
            .Select(r => new TaxResponse
            {
                Form = Enum.Parse<TaxForm>(r.Form),
                Label = Enum.Parse<TaxFieldLabel>(r.Label),
                Line = r.Line,
                Value = r.Value
            })
            .ToArray();
    }

    public void UpdateResponses(IEnumerable<TaxResponse?>? responses, int year, string name)
    {
        // Clear existing responses
        Responses.Clear();

        // Add new responses
        if (responses == null)
        {
            return;
        }
        foreach (var response in responses)
        {
            if (response == null) continue;
            Responses.Add(new TaxResponseEntity
            {
                Year = year,
                Name = name,
                Form = response.Form.ToString(),
                Label = response.Label.ToString(),
                Line = response.Line,
                Value = response.Value
            });
        }
    }
}
