namespace Core.HubSpot.Models
{
    public class AuthenticateParameters
    {
        public string? ClientId { get; set; }

        public string? RedirectUri { get; set; }

        public string? Code { get; set; }
    }
}