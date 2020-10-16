using System.Collections.Generic;

using Core.HubSpot.Services;

namespace HubSpot
{
    public class HubSpotApiCache : IHubSpotApiCache
    {
        public IDictionary<string, string> CodeAccessTokenCache { get; } = new Dictionary<string, string>();
    }
}