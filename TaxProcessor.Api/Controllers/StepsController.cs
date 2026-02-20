using Microsoft.AspNetCore.Mvc;
using TaxProcessor.Api.Models;

namespace TaxProcessor.Api.Controllers;

[ApiController]
[Route("api/steps")]
public class StepsController : ControllerBase
{
    [HttpGet]
    public ActionResult<object> GetSteps()
    {
        var steps = new List<TaxStep>
        {
            new()
            {
                Step = "filing-status",
                Title = "Filing status",
                Description = "Choose the filing status that matches your household situation.",
                Fields = new()
                {
                    new()
                    {
                        Id = "filingStatus",
                        Label = "Filing status",
                        Type = TaxFieldType.Select,
                        SelectionOptions = new()
                        {
                            "Single",
                            "Married filing jointly",
                            "Married filing separately",
                            "Head of household",
                            "Qualifying surviving spouse",
                        },
                    },
                    new()
                    {
                        Id = "residencyState",
                        Label = "State of residence",
                        Type = TaxFieldType.Text,
                        HelperText = "Used for state-level guidance and credits.",
                    },
                },
            },
            new()
            {
                Step = "income",
                Title = "Income overview",
                Description = "Enter high-level income details to determine required forms.",
                Fields = new()
                {
                    new()
                    {
                        Id = "w2Income",
                        Label = "W-2 wages (total)",
                        Type = TaxFieldType.Currency,
                        HelperText = "Use the total from all W-2s before taxes.",
                    },
                    new()
                    {
                        Id = "selfEmployment",
                        Label = "Self-employment income",
                        Type = TaxFieldType.Currency,
                    },
                    new()
                    {
                        Id = "interestIncome",
                        Label = "Interest income",
                        Type = TaxFieldType.Currency,
                    },
                },
            },
            new()
            {
                Step = "deductions",
                Title = "Deductions and credits",
                Description = "Share common deductions to estimate taxable income.",
                Fields = new()
                {
                    new()
                    {
                        Id = "studentLoanInterest",
                        Label = "Student loan interest paid",
                        Type = TaxFieldType.Currency,
                    },
                    new()
                    {
                        Id = "mortgageInterest",
                        Label = "Mortgage interest paid",
                        Type = TaxFieldType.Currency,
                    },
                    new()
                    {
                        Id = "charitableGifts",
                        Label = "Charitable donations",
                        Type = TaxFieldType.Currency,
                    },
                },
            },
            new()
            {
                Step = "review",
                Title = "Review and next steps",
                Description = "We will summarize your answers and prepare a filing checklist.",
                Fields = new()
                {
                    new()
                    {
                        Id = "preferredContact",
                        Label = "Preferred contact email",
                        Type = TaxFieldType.Text,
                    },
                    new()
                    {
                        Id = "filingDate",
                        Label = "Target filing date",
                        Type = TaxFieldType.Date,
                    },
                },
            },
        };

        return Ok(new { steps });
    }
}
