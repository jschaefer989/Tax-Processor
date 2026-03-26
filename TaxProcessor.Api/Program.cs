using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.AspNetCore.Authentication.Cookies;
using Npgsql;
using TaxProcessor.Api.Controllers;
using TaxProcessor.Api.Data;
using TaxProcessor.Api.Security;
using TaxProcessor.Api.Services;
using TaxProcessor.Api;

SetupHelpers.LoadEnvironmentVariables();

// TODO: modularize this file

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "taxprocessor.auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        options.Events = new CookieAuthenticationEvents
        {
            OnRedirectToLogin = context =>
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            },
            OnRedirectToAccessDenied = context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            },
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddSingleton<StandardDeductionFetcher>();
builder.Services.AddSingleton<TaxTableFetcher>();
builder.Services.AddSingleton<QualifiedDividendsThresholdFetcher>();
builder.Services.AddSingleton<PasswordHashingService>();
builder.Services.AddScoped<RecaptchaValidator>();
builder.Services.AddScoped<EmailSender>();
builder.Services.AddScoped<Func<FilingStatus, TaxCalculator>>(serviceProvider =>
    filingStatus => ActivatorUtilities.CreateInstance<TaxCalculator>(serviceProvider, filingStatus)
);
builder.Services.AddScoped<FileProcessor>();
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowLocal",
        policy =>
        {
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        }
    );
});



var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? Environment.GetEnvironmentVariable("DATABASE_URL");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "No database connection string was found for EF design-time operations."
    );
}

var usingPostgres = false;

if (!string.IsNullOrWhiteSpace(connectionString))
{
    connectionString = SetupHelpers.NormalizeConnectionString(connectionString!);

    if (SetupHelpers.CanConnectToPostgres(connectionString))
    {
        usingPostgres = true;
    }
    else
    {
        Console.WriteLine(
            "Postgres connection is configured but unreachable. Falling back to in-memory storage for local development."
        );
    }
}

if (usingPostgres)
{
    var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
    dataSourceBuilder.EnableDynamicJson();
    var dataSource = dataSourceBuilder.Build();

    builder.Services.AddDbContext<TaxDbContext>(options =>
        options
            .UseNpgsql(dataSource)
            .ConfigureWarnings(warnings =>
                warnings.Ignore(RelationalEventId.PendingModelChangesWarning)
            )
    );
}
else
{
    Console.WriteLine(
        "DATABASE_URL is not set. Falling back to in-memory storage for local development."
    );
    builder.Services.AddDbContext<TaxDbContext>(options =>
        options.UseInMemoryDatabase("TaxProcessorLocal")
    );
}

var app = builder.Build();

app.UseRouting();
app.UseCors("AllowLocal");
app.UseAuthentication();
app.UseAuthorization();

// Automatically create tables on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TaxDbContext>();
    if (usingPostgres)
    {
        db.Database.Migrate();
    }
}

app.MapControllers();

var port = Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? "http://localhost:5000";

app.Run(port);
