using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using TaxProcessor.Api.Models;

namespace TaxProcessor.Api.Data;

public class TaxDbContext : DbContext
{
    public TaxDbContext(DbContextOptions<TaxDbContext> options) : base(options)
    {
    }

    public DbSet<TaxProgressEntity> TaxProgress { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder
            .Entity<TaxProgressEntity>()
            .Property(p => p.Responses)
            .HasColumnType("jsonb")
            .Metadata.SetValueComparer(new ValueComparer<TaxResponse[]>(
                (left, right) => (left ?? Array.Empty<TaxResponse>())
                    .OrderBy(r => r.Id).SequenceEqual((right ?? Array.Empty<TaxResponse>()).OrderBy(r => r.Id)),
                value => value.OrderBy(r => r.Id)
                    .Aggregate(0, (hash, r) => HashCode.Combine(hash, r.Id, r.Value)),
                value => value.OrderBy(r => r.Id).ToArray()
            ));
    }
}
