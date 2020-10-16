namespace Core.HubSpot.Models
{
    public class GetTokenRequest
    {
        public Form? Form { get; set; }
    }

    public class Form
    {
        public string? Grant_type { get; set; }

        public string? Client_id { get; set; }

        public string? Client_secret { get; set; }

        public string? Redirect_uri { get; set; }

        public string? Code { get; set; }
    }
}