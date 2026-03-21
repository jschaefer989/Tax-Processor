using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TaxProcessor.Api.Data;

namespace TaxProcessor.Api.Migrations
{
    [DbContext(typeof(TaxDbContext))]
    [Migration("20260316000300_AddTaxResponseAdditionalIdentifiers")]
    public partial class AddTaxResponseAdditionalIdentifiers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FormCode",
                table: "TaxResponse",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "Subsection",
                table: "TaxResponse",
                type: "text",
                nullable: true
            );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "FormCode", table: "TaxResponse");

            migrationBuilder.DropColumn(name: "Subsection", table: "TaxResponse");
        }
    }
}
