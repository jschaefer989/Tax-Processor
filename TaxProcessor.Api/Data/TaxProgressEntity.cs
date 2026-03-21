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
        return
        [
            .. Responses.Select(response => new TaxResponse(
                form: Enum.Parse<TaxForm>(response.Form),
                label: ParseTaxFieldLabel(response.Label),
                line: response.Line,
                value: response.Value,
                formCode: response.FormCode,
                subsection: response.Subsection
            )),
        ];
    }

    private static TaxFieldLabel ParseTaxFieldLabel(string label)
    {
        if (Enum.TryParse<TaxFieldLabel>(label, ignoreCase: true, out var parsedLabel))
        {
            return parsedLabel;
        }

        return label switch
        {
            "1a" => TaxFieldLabel.oneA,
            "1b" => TaxFieldLabel.oneB,
            "1c" => TaxFieldLabel.oneC,
            "1d" => TaxFieldLabel.oneD,
            "1e" => TaxFieldLabel.oneE,
            "1f" => TaxFieldLabel.oneF,
            "1g" => TaxFieldLabel.oneG,
            "2a" => TaxFieldLabel.twoA,
            "2b" => TaxFieldLabel.twoB,
            "3a" => TaxFieldLabel.threeA,
            "3b" => TaxFieldLabel.threeB,
            _ => throw new ArgumentException($"Requested value '{label}' was not found."),
        };
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
            if (response == null)
                continue;
            Responses.Add(
                new TaxResponseEntity
                {
                    Year = year,
                    Name = name,
                    Form = response.Form.ToString(),
                    Label = response.Label.ToString(),
                    Line = response.Line,
                    Value = response.Value,
                    FormCode = response.FormCode,
                    Subsection = response.Subsection,
                }
            );
        }
    }
}
