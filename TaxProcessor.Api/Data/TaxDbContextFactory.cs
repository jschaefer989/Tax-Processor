using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace TaxProcessor.Api.Data;

// This isn't used anywhere in the actual application, but it's needed for EF Core tools to work properly. 
// It provides a way for the tools to create an instance of the DbContext when it needs to perform design-time 
// operations like migrations.
public class TaxDbContextFactory : IDesignTimeDbContextFactory<TaxDbContext>
{
    public TaxDbContext CreateDbContext(string[] args)
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? Environment.GetEnvironmentVariable("DATABASE_URL");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "No database connection string was found for EF design-time operations."
            );
        }

        var optionsBuilder = new DbContextOptionsBuilder<TaxDbContext>();
        optionsBuilder.UseNpgsql(SetupHelpers.NormalizeConnectionString(connectionString));
        return new TaxDbContext(optionsBuilder.Options);
    }
}
