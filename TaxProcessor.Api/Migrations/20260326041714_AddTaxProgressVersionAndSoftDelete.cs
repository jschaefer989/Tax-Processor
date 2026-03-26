using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaxProcessor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTaxProgressVersionAndSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAtUtc",
                table: "TaxProgress",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "Version",
                table: "TaxProgress",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedAtUtc",
                table: "TaxProgress");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "TaxProgress");
        }
    }
}
