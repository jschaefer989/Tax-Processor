    namespace TaxProcessor.Api.Models;
    
    public class DbConnectionTestRequest
    {
        public string Host { get; set; } = string.Empty;

        public int Port { get; set; } = 5432;

        public string Database { get; set; } = string.Empty;

        public string Username { get; set; } = string.Empty;

        public string? Password { get; set; }
    }