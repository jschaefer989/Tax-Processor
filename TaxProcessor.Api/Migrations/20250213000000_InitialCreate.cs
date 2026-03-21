using Microsoft.EntityFrameworkCore.Migrations;

namespace TaxProcessor.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TaxProgress",
                columns: table => new
                {
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CurrentStepId = table.Column<string>(type: "text", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaxProgress", x => new { x.Year, x.Name });
                }
            );

            migrationBuilder.CreateTable(
                name: "TaxResponse",
                columns: table => new
                {
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Form = table.Column<string>(type: "text", nullable: false),
                    Label = table.Column<string>(type: "text", nullable: false),
                    Line = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "PK_TaxResponse",
                        x => new
                        {
                            x.Year,
                            x.Name,
                            x.Form,
                            x.Label,
                            x.Line,
                        }
                    );
                    table.ForeignKey(
                        name: "FK_TaxResponse_TaxProgress_Year_Name",
                        columns: x => new { x.Year, x.Name },
                        principalTable: "TaxProgress",
                        principalColumns: new[] { "Year", "Name" },
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_TaxResponse_Year_Name",
                table: "TaxResponse",
                columns: new[] { "Year", "Name" }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "TaxResponse");

            migrationBuilder.DropTable(name: "TaxProgress");
        }
    }
}
