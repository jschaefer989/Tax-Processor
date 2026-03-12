namespace TaxProcessor.Api.Data;

using Microsoft.VisualBasic.FileIO;
using TaxProcessor.Api.Models;

public class Form1099Processor : FileProcessor
{
    private bool IsHeader = false;
    private ReadableForm? CurrentForm = null;
    private int ShortLine = 0;
    private int LongLine = 0;

    private readonly List<TaxResponse> Responses = [];
    private static readonly Dictionary<ReadableForm, string[]> expectedHeaders = new()
    {
        { ReadableForm.Form1099DIV, new[] { "Box", "Description", "Amount", "Total", "Details" } },
        { ReadableForm.Form1099INT, new[] { "Box", "Description", "Amount", "Total", "Details" } },
        { ReadableForm.Form1099B, new[] { "1a", "1b", "1c", "1d", "1e", "1f", "1g", "2", "", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16" } },
    };

    public async Task<FileProcessorResult> Process(string filePath)
    {
        try
        {
            using TextFieldParser parser = new(filePath);
            parser.SetDelimiters(",");

            while (!parser.EndOfData)
            {
                JumpToQuotedLine(parser);
                parser.HasFieldsEnclosedInQuotes = true;

                string[] fields = RemoveEmptyEndingField(parser.ReadFields() ?? []);
                if (fields.Length == 1) // This is a form line
                {
                    ProcessFormLine(fields);
                }
                else if (IsHeader && CurrentForm.HasValue)
                {
                    ProcessHeaderLine(parser, fields);
                }
                else if (CurrentForm.HasValue)
                {
                    // This is a data line for the current form
                    if (CurrentForm.Value == ReadableForm.Form1099DIV)
                    {
                        ProcessForm1099DIVLine(new Form1099DIVLine(fields));
                    }
                    else if (CurrentForm.Value == ReadableForm.Form1099INT)
                    {
                        ProcessForm1099INTLine(new Form1099INTLine(fields));
                    }
                    else if (CurrentForm.Value == ReadableForm.Form1099B)
                    {
                        ProcessForm1099BLine(new Form1099BLine(fields));
                    }
                }
            }
        }
        catch (Exception ex)
        {
            return new FileProcessorResult(false, [], $"Error processing file: {ex.Message}");
        }

        return new FileProcessorResult(true, [.. Responses], string.Empty);
    }

    private void ProcessFormLine(string[] fields)
    {
        string formName = string.Concat(fields[0].Where(character => !char.IsWhiteSpace(character)));
        if (Enum.TryParse<ReadableForm>(formName, out var parsedForm))
        {
            CurrentForm = parsedForm;
            IsHeader = true;
        }
    }

    private void ProcessHeaderLine(TextFieldParser parser, string[] fields)
    {
        if (CurrentForm.HasValue && expectedHeaders.TryGetValue(CurrentForm.Value, out var expected))
        {
            if (!ValidateHeaders(fields, expected))
            {
                throw new InvalidOperationException($"Invalid headers for {CurrentForm.Value}. Expected: {string.Join(", ", expected)}, Got: {string.Join(", ", fields)}");
            }
        }

        if (CurrentForm.HasValue && CurrentForm.Value == ReadableForm.Form1099B)
        {
            parser.ReadLine(); // Skip the second header line for 1099-B
        }
        IsHeader = false;
    }

    private void ProcessForm1099DIVLine(Form1099DIVLine line)
    {
        if (line.Box == "1a")
        {
            Responses.Add(new TaxResponse
            {
                Form = TaxForm.Form1040,
                Label = TaxFieldLabel.threeB,
                Line = 1,
                Value = line.Total,
            });
        }
        if (line.Box == "1b")
        {
            Responses.Add(new TaxResponse
            {
                Form = TaxForm.Form1040,
                Label = TaxFieldLabel.threeA,
                Line = 1,
                Value = line.Amount,
            });
        }
    }

    private void ProcessForm1099INTLine(Form1099INTLine line)
    {
        if (line.Box == "1")
        {
            Responses.Add(new TaxResponse
            {
                Form = TaxForm.Form1040,
                Label = TaxFieldLabel.twoB,
                Line = 1,
                Value = line.Total,
            });
        }
        else if (line.Box == "2")
        {
            Responses.Add(new TaxResponse
            {
                Form = TaxForm.Form1040,
                Label = TaxFieldLabel.twoA,
                Line = 1,
                Value = line.Total,
            });
        }
    }

    private void ProcessForm1099BLine(Form1099BLine line)
    {
        var term = line.Term;
        var form = Get1099BTaxForm(term);
        var lineNumber = IncrementLine(form);

        Responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.oneA,
            Line = lineNumber,
            Value = line.Description,
        });
        Responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.oneB,
            Line = lineNumber,
            Value = line.DateAcquired,
        });
        Responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.oneC,
            Line = lineNumber,
            Value = line.DateSold,
        });
        Responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.oneD,
            Line = lineNumber,
            Value = line.Proceeds,
        });
        Responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.oneE,
            Line = lineNumber,
            Value = line.CostBasis,
        });
        Responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.oneF,
            Line = lineNumber,
            Value = line.MarketDiscount,
        });
        Responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.oneG,
            Line = lineNumber,
            Value = line.WashSaleLossDisallowed,
        });
        Responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.formCode,
            Line = lineNumber,
            Value = line.FormCode,
        });
    }

    private static TaxForm Get1099BTaxForm(string term)
    {
        if (term.Trim().Equals("short term", StringComparison.CurrentCultureIgnoreCase))
        {
            return TaxForm.Form8949Page1;
        }
        else if (term.Trim().Equals("long term", StringComparison.CurrentCultureIgnoreCase))
        {
            return TaxForm.Form8949Page2;
        }
        else
        {
            throw new InvalidOperationException($"Invalid term for 1099-B line: {term}");
        }
    }

    private int IncrementLine(TaxForm form)
    {
        if (form == TaxForm.Form8949Page1)
        {
            return ShortLine++;
        }
        else if (form == TaxForm.Form8949Page2)
        {
            return LongLine++;
        }
        else
        {
            throw new InvalidOperationException($"Invalid form for line increment: {form}");
        }
    }

    private class Form1099DIVLine
    {
        public string Box { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Amount { get; set; } = string.Empty;
        public string Total { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;

        public Form1099DIVLine() { }

        public Form1099DIVLine(string[] fields)
        {
            Box = fields[0];
            Description = fields[1];
            Amount = fields[2];
            Total = fields[3];
            Details = fields[4];
        }
    }

    private class Form1099INTLine
    {
        public string Box { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Amount { get; set; } = string.Empty;
        public string Total { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;

        public Form1099INTLine() { }

        public Form1099INTLine(string[] fields)
        {
            Box = fields[0];
            Description = fields[1];
            Amount = fields[2];
            Total = fields[3];
            Details = fields[4];
        }
    }

    private class Form1099BLine
    {
        public string Description { get; set; } = string.Empty;
        public string DateAcquired { get; set; } = string.Empty;
        public string DateSold { get; set; } = string.Empty;
        public string Proceeds { get; set; } = string.Empty;
        public string CostBasis { get; set; } = string.Empty;
        public string MarketDiscount { get; set; } = string.Empty;
        public string WashSaleLossDisallowed { get; set; } = string.Empty;
        public string Term { get; set; } = string.Empty;
        public string FormCode { get; set; } = string.Empty;

        public Form1099BLine() { }

        public Form1099BLine(string[] fields)
        {
            Description = fields[0];
            DateAcquired = fields[1];
            DateSold = fields[2];
            Proceeds = fields[3];
            CostBasis = fields[4];
            MarketDiscount = fields[5];
            WashSaleLossDisallowed = fields[6];
            Term = fields[7];
            FormCode = fields[8];
        }
    }
}