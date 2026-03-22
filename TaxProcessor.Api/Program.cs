using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.IO;
using Npgsql;
using TaxProcessor.Api.Controllers;
using TaxProcessor.Api.Data;
using TaxProcessor.Api.Security;
using TaxProcessor.Api.Services;
using dotenv.net;

LoadEnvironmentVariables();

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



var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
}

var usingPostgres = false;

if (!string.IsNullOrWhiteSpace(connectionString))
{
    connectionString = NormalizeConnectionString(connectionString!);

    if (CanConnectToPostgres(connectionString))
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

static void LoadEnvironmentVariables()
{
    var currentDirectory = Directory.GetCurrentDirectory();
    var appBaseDirectory = AppContext.BaseDirectory;

    var envFiles = new[]
    {
        Path.Combine(currentDirectory, ".env"),
        Path.GetFullPath(Path.Combine(currentDirectory, "..", ".env")),
        Path.Combine(appBaseDirectory, ".env"),
        Path.GetFullPath(Path.Combine(appBaseDirectory, "..", "..", "..", "..", ".env")),
    }
        .Where(File.Exists)
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();

    if (envFiles.Length == 0)
    {
        return;
    }

    DotEnv.Load(
        options: new DotEnvOptions(
            envFilePaths: envFiles,
            overwriteExistingVars: false,
            ignoreExceptions: true
        )
    );
}

// TODO: see if this stuff can be done with libraries instead of custom code
static string NormalizeConnectionString(string connectionString)
{
    if (
        !connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
        && !connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)
    )
    {
        return connectionString;
    }

    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':', 2);
    var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : string.Empty;
    var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
    var database = uri.AbsolutePath.TrimStart('/');
    var queryParams = ParseQuery(uri.Query);

    var builder = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Username = username,
        Password = password,
        Database = database,
    };

    if (
        queryParams.TryGetValue("sslmode", out var sslModeValue)
        && Enum.TryParse<SslMode>(sslModeValue, true, out var sslMode)
    )
    {
        builder.SslMode = sslMode;
    }

    return builder.ConnectionString;
}

static Dictionary<string, string> ParseQuery(string query)
{
    var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

    if (string.IsNullOrWhiteSpace(query))
    {
        return result;
    }

    var trimmed = query.TrimStart('?');
    foreach (var pair in trimmed.Split('&', StringSplitOptions.RemoveEmptyEntries))
    {
        var split = pair.Split('=', 2);
        var key = Uri.UnescapeDataString(split[0]);
        var value = split.Length > 1 ? Uri.UnescapeDataString(split[1]) : string.Empty;
        if (!string.IsNullOrWhiteSpace(key))
        {
            result[key] = value;
        }
    }

    return result;
}

static bool CanConnectToPostgres(string connectionString)
{
    try
    {
        var testBuilder = new NpgsqlConnectionStringBuilder(connectionString)
        {
            Timeout = 2,
            CommandTimeout = 2,
        };

        using var connection = new NpgsqlConnection(testBuilder.ConnectionString);
        connection.Open();
        return true;
    }
    catch
    {
        return false;
    }
}
