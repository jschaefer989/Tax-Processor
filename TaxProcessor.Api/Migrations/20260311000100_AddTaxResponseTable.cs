using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using TaxProcessor.Api.Data;

namespace TaxProcessor.Api.Migrations
{
    [DbContext(typeof(TaxDbContext))]
    [Migration("20260311000100_AddTaxResponseTable")]
    public partial class AddTaxResponseTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"CREATE TABLE IF NOT EXISTS ""TaxResponse"" (
                    ""Year"" integer NOT NULL,
                    ""Name"" text NOT NULL,
                    ""Form"" text NOT NULL,
                    ""Label"" text NOT NULL,
                    ""Line"" integer NOT NULL,
                    ""Value"" text NULL,
                    CONSTRAINT ""PK_TaxResponse"" PRIMARY KEY (""Year"", ""Name"", ""Form"", ""Label"", ""Line""),
                    CONSTRAINT ""FK_TaxResponse_TaxProgress_Year_Name"" FOREIGN KEY (""Year"", ""Name"") REFERENCES ""TaxProgress"" (""Year"", ""Name"") ON DELETE CASCADE
                );");

            migrationBuilder.Sql(
                @"CREATE INDEX IF NOT EXISTS ""IX_TaxResponse_Year_Name""
                  ON ""TaxResponse"" (""Year"", ""Name"");");

            migrationBuilder.Sql(
                @"DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name = 'TaxProgress'
                          AND column_name = 'Responses'
                    ) THEN
                        INSERT INTO ""TaxResponse"" (""Year"", ""Name"", ""Form"", ""Label"", ""Line"", ""Value"")
                        SELECT
                            tp.""Year"",
                            tp.""Name"",
                            COALESCE(resp->>'Form', ''),
                            COALESCE(resp->>'Label', ''),
                            COALESCE((resp->>'Line')::integer, 0),
                            resp->>'Value'
                        FROM ""TaxProgress"" tp
                        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(tp.""Responses"", '[]'::jsonb)) resp
                        ON CONFLICT DO NOTHING;
                    END IF;
                END $$;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TaxResponse");
        }
    }
}
