using TaxProcessor.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace TaxProcessor.Api.Migrations
{
    [DbContext(typeof(TaxDbContext))]
    partial class TaxDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.13")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("TaxProcessor.Api.Data.TaxProgressEntity", builder =>
                {
                    builder.Property<int>("Year")
                        .HasColumnType("integer");

                    builder.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    builder.Property<string>("CurrentStepId")
                        .HasColumnType("text");

                    builder.Property<DateTime>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    builder.HasKey("Year", "Name");

                    builder.ToTable("TaxProgress");

                    builder.Navigation("Responses");
                });

            modelBuilder.Entity("TaxProcessor.Api.Data.TaxResponseEntity", builder =>
                {
                    builder.Property<int>("Year")
                        .HasColumnType("integer");

                    builder.Property<string>("Name")
                        .HasColumnType("text");

                    builder.Property<string>("Form")
                        .HasColumnType("text");

                    builder.Property<string>("Label")
                        .HasColumnType("text");

                    builder.Property<int>("Line")
                        .HasColumnType("integer");

                    builder.Property<string>("Value")
                        .HasColumnType("text");

                    builder.HasKey("Year", "Name", "Form", "Label", "Line");

                    builder.HasIndex("Year", "Name");

                    builder.ToTable("TaxResponse");

                    builder.HasOne("TaxProcessor.Api.Data.TaxProgressEntity", "TaxProgress")
                        .WithMany("Responses")
                        .HasForeignKey("Year", "Name")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    builder.Navigation("TaxProgress");
                });

#pragma warning restore 612, 618
        }
    }
}
