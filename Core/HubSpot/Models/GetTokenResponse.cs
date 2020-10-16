using System;
using System.Collections.Generic;
using System.Text;

namespace Core.HubSpot.Models
{
    public class GetTokenResponse
    {
        public string? Refresh_token { get; set; }

        public string? Access_token { get; set; }

        public int Expires_in { get; set; }
    }
}