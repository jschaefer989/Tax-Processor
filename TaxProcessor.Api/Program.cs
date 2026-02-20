using TaxProcessor.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocal", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

LoadDotEnv();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
}

if (string.IsNullOrEmpty(connectionString))
{
    Console.WriteLine("DATABASE_URL is not set. Provide a Postgres connection string.");
    Environment.Exit(1);
}

connectionString = NormalizeConnectionString(connectionString);

var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.EnableDynamicJson();
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<TaxDbContext>(options =>
    options
    .UseNpgsql(dataSource)
        .ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning))
);

var app = builder.Build();

app.UseRouting();
app.UseCors("AllowLocal");

// Automatically create tables on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TaxDbContext>();
    db.Database.Migrate();
}

app.MapControllers();

var port = Environment.GetEnvironmentVariable("ASPNETCORE_URLS")
    ?? "http://localhost:5000";

app.Run(port);

static void LoadDotEnv()
{
    var current = new DirectoryInfo(Directory.GetCurrentDirectory());

    while (current != null)
    {
        var envPath = Path.Combine(current.FullName, ".env");
        if (File.Exists(envPath))
        {
            foreach (var line in File.ReadAllLines(envPath))
            {
                var trimmed = line.Trim();
                if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("#", StringComparison.Ordinal))
                {
                    continue;
                }

                var splitIndex = trimmed.IndexOf('=');
                if (splitIndex <= 0)
                {
                    continue;
                }

                var key = trimmed[..splitIndex].Trim();
                var value = trimmed[(splitIndex + 1)..].Trim();
                if (!string.IsNullOrEmpty(key) && Environment.GetEnvironmentVariable(key) == null)
                {
                    Environment.SetEnvironmentVariable(key, value);
                }
            }

            break;
        }

        current = current.Parent;
    }
}

static string NormalizeConnectionString(string connectionString)
{
    if (!connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
        && !connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
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
        Database = database
    };

    if (queryParams.TryGetValue("sslmode", out var sslModeValue)
        && Enum.TryParse<SslMode>(sslModeValue, true, out var sslMode))
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
