using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TaxProcessor.Api.Data;

namespace TaxProcessor.Api.Migrations
{
    [DbContext(typeof(TaxDbContext))]
    [Migration("20260312000200_RemoveLegacyResponsesColumn")]
    public partial class RemoveLegacyResponsesColumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"ALTER TABLE IF EXISTS ""TaxProgress""
                                    DROP COLUMN IF EXISTS ""Responses"";"
            );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"ALTER TABLE IF EXISTS ""TaxProgress""
                                    ADD COLUMN IF NOT EXISTS ""Responses"" jsonb NOT NULL DEFAULT '[]'::jsonb;"
            );
        }
    }
}
