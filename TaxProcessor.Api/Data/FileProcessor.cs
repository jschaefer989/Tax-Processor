namespace TaxProcessor.Api.Data;

using Microsoft.AspNetCore.Http;
using Microsoft.VisualBasic.FileIO;
using TaxProcessor.Api.Models;

public class FileProcessorResult(bool success, List<TaxResponse> responses, string? errorMessage)
{
    public bool Success { get; private set; } = success;
    public List<TaxResponse> Responses { get; private set; } = responses;
    public string? ErrorMessage { get; private set; } = errorMessage;
}

public class FileProcessor
{
    public async Task<FileProcessorResult> ProcessFile(IFormFile file, ReadableForm form)
    {
        if (file == null || file.Length == 0)
        {
            return new FileProcessorResult(false, [], "No file provided.");
        }

        return await ParseCsvFile(file, form);
    }

    private static async Task<FileProcessorResult> ParseCsvFile(IFormFile file, ReadableForm form)
    {
        string tempFilePath = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".csv");

        try
        {
            using (var stream = new FileStream(tempFilePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            return form switch
            {
                ReadableForm.Form1099 => await new Form1099Processor().Process(tempFilePath),
                _ => new FileProcessorResult(false, [], "Unsupported form type."),
            };
        }
        catch (Exception ex)
        {
            return new FileProcessorResult(false, [], $"Error processing file: {ex.Message}");
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

    public static bool ValidateHeaders(string[] actual, string[] expected)
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

    public string[] RemoveEmptyEndingField(string[] fields)
    {
        if (fields.Length > 0 && string.IsNullOrWhiteSpace(fields.Last()))
        {
            return fields.Take(fields.Length - 1).ToArray();
        }
        return fields;
    }

    public void JumpToQuotedLine(TextFieldParser parser)
    {
        while (parser.PeekChars(1) != "\"") // Skip until we find a quote
        {
            parser.HasFieldsEnclosedInQuotes = false;
            parser.ReadLine();
        }
    }
}
