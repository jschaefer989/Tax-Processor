using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace TaxProcessor.Api.Data;

// This isn't used anywhere in the actual application, but it's needed for EF Core tools to work properly. 
// It provides a way for the tools to create an instance of the DbContext when it needs to perform design-time 
// operations like migrations.
public class TaxDbContextFactory : IDesignTimeDbContextFactory<TaxDbContext>
{
    public TaxDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<TaxDbContext>();
        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5432;Database=taxprocessor_design;Username=postgres;Password=postgres"
        );
        return new TaxDbContext(optionsBuilder.Options);
    }
}
