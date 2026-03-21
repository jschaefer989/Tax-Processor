using Microsoft.EntityFrameworkCore;

namespace TaxProcessor.Api.Data;

public class TaxDbContext : DbContext
{
    public TaxDbContext(DbContextOptions<TaxDbContext> options)
        : base(options) { }

    public DbSet<TaxProgressEntity> TaxProgress { get; set; } = null!;

    public DbSet<TaxResponseEntity> TaxResponse { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure foreign key relationship
        modelBuilder
            .Entity<TaxResponseEntity>()
            .HasOne(r => r.TaxProgress)
            .WithMany(p => p.Responses)
            .HasForeignKey(r => new { r.Year, r.Name })
            .OnDelete(DeleteBehavior.Cascade);
    }
}
