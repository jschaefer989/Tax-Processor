using TaxProcessor.Api.Models;
using Microsoft.VisualBasic.FileIO;

public class FileProcessorResult
{
    public bool Success { get; private set; }
    public List<TaxResponse> Responses { get; private set; }
    public string? ErrorMessage { get; private set; }

    public FileProcessorResult(bool success, List<TaxResponse> responses, string? errorMessage)
    {
        Success = success;
        Responses = responses;
        ErrorMessage = errorMessage;
    }
}
public class FileProcessor
{

    public async Task<FileProcessorResult> ProcessFile(IFormFile file, ReadableForm form)
    {
        if (file == null || file.Length == 0)
        {
            return new FileProcessorResult(false, new List<TaxResponse>(), "No file provided.");
        }


        return await ParseCsvFile(file, form);
    }

    private async Task<FileProcessorResult> ParseCsvFile(IFormFile file, ReadableForm form)
    {
        string tempFilePath = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".csv");

        try
        {
            using (var stream = new FileStream(tempFilePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            switch (form)
            {
                case ReadableForm.Form1099:
                    return await Process1099File(tempFilePath);
                default:
                    return new FileProcessorResult(false, new List<TaxResponse>(), "Unsupported form type.");
            }
        }
        catch (Exception ex)
        {
            return new FileProcessorResult(false, new List<TaxResponse>(), $"Error processing file: {ex.Message}");
        }
        finally
        {
            // Clean up temp file
            if (File.Exists(tempFilePath))
            {
                File.Delete(tempFilePath);
            }
        }
    }

    private async Task<FileProcessorResult> Process1099File(string filePath)
    {
        List<TaxResponse> responses = new List<TaxResponse>();

        // Define expected headers for each form type
        var expectedHeaders = new Dictionary<ReadableForm, string[]>
        {
            { ReadableForm.Form1099DIV, new[] { "Box", "Description", "Amount", "Total", "Details" } },
            { ReadableForm.Form1099INT, new[] { "Box", "Description", "Amount", "Total", "Details" } },
            { ReadableForm.Form1099B, new[] { "1a", "1b", "1c", "1d", "1e", "1f", "1g", "2", "", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16" } },
        };

        try
        {
            using (TextFieldParser parser = new TextFieldParser(filePath))
            {
                parser.SetDelimiters(",");

                bool isHeader = false;
                ReadableForm? currentForm = null;
                int shortLine = 1;
                int longLine = 1;
                while (!parser.EndOfData)
                {
                    while (parser.PeekChars(1) != "\"") // Skip until we find a quote
                    {
                        parser.HasFieldsEnclosedInQuotes = false;
                        parser.ReadLine();
                    }
                    parser.HasFieldsEnclosedInQuotes = true;

                    string[] fields = RemoveEmptyEndingField(parser.ReadFields() ?? Array.Empty<string>()); 
                    if (fields.Length == 1)
                    {
                        string formName = String.Concat(fields[0].Where(character => !Char.IsWhiteSpace(character)));
                        // This is a form header line
                        if (Enum.TryParse<ReadableForm>(formName, out var parsedForm))
                        {
                            currentForm = parsedForm;
                            isHeader = true;
                        }
                    }
                    else if (isHeader && currentForm.HasValue)
                    {
                        // Validate headers for the current form
                        if (expectedHeaders.TryGetValue(currentForm.Value, out var expected))
                        {
                            if (!ValidateHeaders(fields, expected))
                            {
                                throw new InvalidOperationException($"Invalid headers for {currentForm.Value}. Expected: {string.Join(", ", expected)}, Got: {string.Join(", ", fields)}");
                            }
                        }

                        if (currentForm.Value == ReadableForm.Form1099B)
                        {
                            parser.ReadLine(); // Skip the second header line for 1099-B
                        }
                        isHeader = false;
                    }
                    else if (currentForm.HasValue)
                    {
                        // This is a data line for the current form
                        if (currentForm.Value == ReadableForm.Form1099DIV)
                        {
                            string box = fields[0];
                            string description = fields[1];
                            string amount = fields[2];
                            string total = fields[3];
                            string details = fields[4];

                            if (box == "1a")
                            {

                                responses.Add(new TaxResponse
                                {
                                    Form = TaxForm.Form1040,
                                    Label = TaxFieldLabel.threeB,
                                    Line = 1,
                                    Value = total,
                                });
                            }
                            if (box == "1b")
                            {
                                responses.Add(new TaxResponse
                                {
                                    Form = TaxForm.Form1040,
                                    Label = TaxFieldLabel.threeA,
                                    Line = 1,
                                    Value = amount,
                                });
                            }
                        }
                        else if (currentForm.Value == ReadableForm.Form1099INT)
                        {
                            string box = fields[0];
                            string description = fields[1];
                            string amount = fields[2];
                            string total = fields[3];
                            string details = fields[4];

                            if (box == "1")
                            {

                                responses.Add(new TaxResponse
                                {
                                    Form = TaxForm.Form1040,
                                    Label = TaxFieldLabel.twoB,
                                    Line = 1,
                                    Value = total,
                                });
                            }
                            else if (box == "2")
                            {

                                responses.Add(new TaxResponse
                                {
                                    Form = TaxForm.Form1040,
                                    Label = TaxFieldLabel.twoA,
                                    Line = 1,
                                    Value = total,
                                });
                            }
                        }
                        else if (currentForm.Value == ReadableForm.Form1099B)
                        {
                            string term = fields[7];

                            if (term == "Short term")
                            {
                                Get1099BResponses(responses, fields, TaxForm.Form8949Page1, ref shortLine);
                            }
                            else if (term == "Long term")
                            {
                                Get1099BResponses(responses, fields, TaxForm.Form8949Page2, ref longLine);
                            }
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            return new FileProcessorResult(false, new List<TaxResponse>(), $"Error processing file: {ex.Message}");
        }

        return new FileProcessorResult(true, responses, string.Empty);
    }

    private bool ValidateHeaders(string[] actual, string[] expected)
    {
        if (actual.Length != expected.Length)
        {
            return false;
        }

        for (int i = 0; i < actual.Length; i++)
        {
            if (!actual[i].Equals(expected[i], StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
        }

        return true;
    }

    private void Get1099BResponses(List<TaxResponse> responses, string[] fields, TaxForm form, ref int line)
    {
        string description = fields[0];
        string dateAquired = fields[1];
        string dateSold = fields[2];
        string proceeds = fields[3];
        string costBasis = fields[4];
        string marketDiscount = fields[5];
        string washSaleLossDisallowed = fields[6];
        string formCode = fields[8];

        responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.oneA,
            Line = line++,
            Value = description,
        });
        responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.oneB,
            Line = line++,
            Value = dateAquired,
        });
        responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.oneC,
            Line = line++,
            Value = dateSold,
        });
        responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.oneD,
            Line = line++,
            Value = proceeds,
        });
        responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.oneE,
            Line = line++,
            Value = costBasis,
        });
        responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.oneF,
            Line = line++,
            Value = marketDiscount,
        });
        responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.oneG,
            Line = line++,
            Value = washSaleLossDisallowed,
        });
        responses.Add(new TaxResponse
        {
            Form = form,
            Label = TaxFieldLabel.formCode,
            Line = line++,
            Value = formCode,
        });
    }

    private string[] RemoveEmptyEndingField(string[] fields)
    {
        if (fields.Length > 0 && string.IsNullOrWhiteSpace(fields.Last()))
        {
            return fields.Take(fields.Length - 1).ToArray();
        }
        return fields;
    }
}