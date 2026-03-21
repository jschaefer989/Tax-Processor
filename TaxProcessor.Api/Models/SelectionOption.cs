using System.Diagnostics.CodeAnalysis;

namespace TaxProcessor.Api.Data;

public class SelectionOption
{
    public required string Value { get; set; }
    public required string DisplayText { get; set; }

    public SelectionOption() { }

    [SetsRequiredMembers]
    public SelectionOption(string value)
    {
        Value = value;
        DisplayText = value;
    }

    [SetsRequiredMembers]
    public SelectionOption(string value, string displayText)
    {
        Value = value;
        DisplayText = displayText;
    }
}
