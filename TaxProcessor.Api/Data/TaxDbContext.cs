using Microsoft.EntityFrameworkCore;

namespace TaxProcessor.Api.Data;

public class TaxDbContext : DbContext
{
    public TaxDbContext(DbContextOptions<TaxDbContext> options)
        : base(options) { }

    public DbSet<ProfileEntity> Profiles { get; set; } = null!;

    public DbSet<TaxProgressEntity> TaxProgress { get; set; } = null!;

    public DbSet<TaxResponseEntity> TaxResponse { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ProfileEntity>().HasIndex(profile => profile.Email).IsUnique();

        modelBuilder
            .Entity<TaxProgressEntity>()
            .HasOne(progress => progress.Profile)
            .WithMany(profile => profile.ProgressEntries)
            .HasForeignKey(progress => progress.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure foreign key relationship
        modelBuilder
            .Entity<TaxResponseEntity>()
            .HasOne(r => r.TaxProgress)
            .WithMany(p => p.Responses)
            .HasForeignKey(r => new { r.ProfileId, r.Year, r.Name })
            .OnDelete(DeleteBehavior.Cascade);
    }
}
