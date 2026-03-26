using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaxProcessor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLoginEmailOtp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LoginOtpChallengeTokenHash",
                table: "Profiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LoginOtpCodeExpiresAtUtc",
                table: "Profiles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LoginOtpCodeHash",
                table: "Profiles",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LoginOtpChallengeTokenHash",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "LoginOtpCodeExpiresAtUtc",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "LoginOtpCodeHash",
                table: "Profiles");
        }
    }
}
