using System.Collections.Generic;

namespace Core.HubSpot.Services
{
    public interface IHubSpotApiCache
    {
        IDictionary<string, string> CodeAccessTokenCache { get; }
    }
}