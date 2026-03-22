using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaxProcessor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProfilesAndAuth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
                        migrationBuilder.Sql(
                                @"CREATE TABLE IF NOT EXISTS ""Profiles"" (
                                        ""Id"" uuid NOT NULL,
                                        ""Email"" text NOT NULL,
                                        ""PasswordHash"" text NOT NULL,
                                        ""PasswordSalt"" text NOT NULL,
                                        ""CreatedAtUtc"" timestamp with time zone NOT NULL,
                                        ""LastLoginAtUtc"" timestamp with time zone NOT NULL,
                                        ""PasswordResetTokenHash"" text NULL,
                                        ""PasswordResetTokenExpiresAtUtc"" timestamp with time zone NULL,
                                        CONSTRAINT ""PK_Profiles"" PRIMARY KEY (""Id"")
                                );"
                        );

                        migrationBuilder.Sql(
                                @"INSERT INTO ""Profiles"" (""Id"", ""Email"", ""PasswordHash"", ""PasswordSalt"", ""CreatedAtUtc"", ""LastLoginAtUtc"")
                                    SELECT '00000000-0000-0000-0000-000000000001', 'legacy@local.invalid', 'legacy', 'legacy', NOW(), NOW()
                                    WHERE NOT EXISTS (
                                        SELECT 1 FROM ""Profiles"" WHERE ""Id"" = '00000000-0000-0000-0000-000000000001'
                                    );"
                        );

                        migrationBuilder.Sql(
                                @"ALTER TABLE ""TaxProgress""
                                    ADD COLUMN IF NOT EXISTS ""ProfileId"" uuid;"
                        );

                        migrationBuilder.Sql(
                                @"UPDATE ""TaxProgress""
                                    SET ""ProfileId"" = '00000000-0000-0000-0000-000000000001'
                                    WHERE ""ProfileId"" IS NULL;"
                        );

                        migrationBuilder.Sql(
                                @"ALTER TABLE ""TaxProgress""
                                    ALTER COLUMN ""ProfileId"" SET NOT NULL;"
                        );

                        migrationBuilder.Sql(
                                @"ALTER TABLE ""TaxResponse""
                                    ADD COLUMN IF NOT EXISTS ""ProfileId"" uuid;"
                        );

                        migrationBuilder.Sql(
                                @"UPDATE ""TaxResponse"" r
                                    SET ""ProfileId"" = p.""ProfileId""
                                    FROM ""TaxProgress"" p
                                    WHERE r.""Year"" = p.""Year""
                                        AND r.""Name"" = p.""Name""
                                        AND r.""ProfileId"" IS NULL;"
                        );

                        migrationBuilder.Sql(
                                @"UPDATE ""TaxResponse""
                                    SET ""ProfileId"" = '00000000-0000-0000-0000-000000000001'
                                    WHERE ""ProfileId"" IS NULL;"
                        );

                        migrationBuilder.Sql(
                                @"ALTER TABLE ""TaxResponse""
                                    ALTER COLUMN ""ProfileId"" SET NOT NULL;"
                        );

                        migrationBuilder.Sql(
                                @"ALTER TABLE ""TaxResponse""
                                    DROP CONSTRAINT IF EXISTS ""FK_TaxResponse_TaxProgress_Year_Name"";"
                        );

                        migrationBuilder.Sql(
                                @"ALTER TABLE ""TaxResponse""
                                    DROP CONSTRAINT IF EXISTS ""PK_TaxResponse"";"
                        );

                        migrationBuilder.Sql(
                                @"ALTER TABLE ""TaxProgress""
                                    DROP CONSTRAINT IF EXISTS ""PK_TaxProgress"";"
                        );

                        migrationBuilder.Sql(
                                @"ALTER TABLE ""TaxProgress""
                                    ADD CONSTRAINT ""PK_TaxProgress"" PRIMARY KEY (""ProfileId"", ""Year"", ""Name"");"
                        );

                        migrationBuilder.Sql(
                                @"ALTER TABLE ""TaxResponse""
                                    ADD CONSTRAINT ""PK_TaxResponse"" PRIMARY KEY (""ProfileId"", ""Year"", ""Name"", ""Form"", ""Label"", ""Line"");"
                        );

                        migrationBuilder.Sql(
                                @"ALTER TABLE ""TaxProgress""
                                    ADD CONSTRAINT ""FK_TaxProgress_Profiles_ProfileId""
                                    FOREIGN KEY (""ProfileId"") REFERENCES ""Profiles"" (""Id"") ON DELETE CASCADE;"
                        );

                        migrationBuilder.Sql(
                                @"ALTER TABLE ""TaxResponse""
                                    ADD CONSTRAINT ""FK_TaxResponse_TaxProgress_ProfileId_Year_Name""
                                    FOREIGN KEY (""ProfileId"", ""Year"", ""Name"")
                                    REFERENCES ""TaxProgress"" (""ProfileId"", ""Year"", ""Name"") ON DELETE CASCADE;"
                        );

                        migrationBuilder.Sql(
                                @"DROP INDEX IF EXISTS ""IX_TaxResponse_Year_Name"";
                                    CREATE INDEX IF NOT EXISTS ""IX_TaxResponse_ProfileId_Year_Name""
                                    ON ""TaxResponse"" (""ProfileId"", ""Year"", ""Name"");"
                        );

                        migrationBuilder.Sql(
                                @"CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Profiles_Email"" ON ""Profiles"" (""Email"");"
                        );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"ALTER TABLE ""TaxResponse""
                  DROP CONSTRAINT IF EXISTS ""FK_TaxResponse_TaxProgress_ProfileId_Year_Name"";"
            );

            migrationBuilder.Sql(
                @"ALTER TABLE ""TaxProgress""
                  DROP CONSTRAINT IF EXISTS ""FK_TaxProgress_Profiles_ProfileId"";"
            );

            migrationBuilder.Sql(
                @"ALTER TABLE ""TaxResponse""
                  DROP CONSTRAINT IF EXISTS ""PK_TaxResponse"";"
            );

            migrationBuilder.Sql(
                @"ALTER TABLE ""TaxProgress""
                  DROP CONSTRAINT IF EXISTS ""PK_TaxProgress"";"
            );

            migrationBuilder.Sql(
                @"ALTER TABLE ""TaxProgress""
                  ADD CONSTRAINT ""PK_TaxProgress"" PRIMARY KEY (""Year"", ""Name"");"
            );

            migrationBuilder.Sql(
                @"ALTER TABLE ""TaxResponse""
                  ADD CONSTRAINT ""PK_TaxResponse"" PRIMARY KEY (""Year"", ""Name"", ""Form"", ""Label"", ""Line"");"
            );

            migrationBuilder.Sql(
                @"ALTER TABLE ""TaxResponse""
                  ADD CONSTRAINT ""FK_TaxResponse_TaxProgress_Year_Name""
                  FOREIGN KEY (""Year"", ""Name"") REFERENCES ""TaxProgress"" (""Year"", ""Name"") ON DELETE CASCADE;"
            );

            migrationBuilder.Sql(
                @"DROP INDEX IF EXISTS ""IX_TaxResponse_ProfileId_Year_Name"";
                  CREATE INDEX IF NOT EXISTS ""IX_TaxResponse_Year_Name""
                  ON ""TaxResponse"" (""Year"", ""Name"");"
            );

            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IX_Profiles_Email"";");

            migrationBuilder.Sql(
                @"ALTER TABLE ""TaxResponse"" DROP COLUMN IF EXISTS ""ProfileId"";"
            );

            migrationBuilder.Sql(
                @"ALTER TABLE ""TaxProgress"" DROP COLUMN IF EXISTS ""ProfileId"";"
            );

            migrationBuilder.Sql(@"DROP TABLE IF EXISTS ""Profiles"";");
        }
    }
}
