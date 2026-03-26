namespace TaxProcessor.Api;

using dotenv.net;
using Npgsql;

public static class SetupHelpers
{
    public static void LoadEnvironmentVariables()
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
public static string NormalizeConnectionString(string connectionString)
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

public static Dictionary<string, string> ParseQuery(string query)
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

public static bool CanConnectToPostgres(string connectionString)
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
}