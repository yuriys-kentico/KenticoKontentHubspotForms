using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

using Core;
using Core.HubSpot.Models;
using Core.HubSpot.Services;

namespace HubSpot
{
    public class HubSpotRepository : IHubSpotRepository
    {
        private readonly HttpClient httpClient;
        private readonly Settings settings;
        private readonly IHubSpotApiCache hubSpotApiCache;

        public HubSpotRepository(
            HttpClient httpClient,
            Settings settings,
            IHubSpotApiCache hubSpotApiCache
            )
        {
            this.httpClient = httpClient;
            this.settings = settings;
            this.hubSpotApiCache = hubSpotApiCache;
        }

        public async Task<IAuthenticateResult> Authenticate(AuthenticateParameters getTokenParameters)
        {
            string? accessToken = null;

            if (!string.IsNullOrWhiteSpace(getTokenParameters.Code)
                && !hubSpotApiCache.CodeAccessTokenCache.TryGetValue(getTokenParameters.Code, out accessToken))
            {
                var formData = new Dictionary<string, string?>
                {
                    { "grant_type",  "authorization_code" },
                    { "client_id", getTokenParameters.ClientId },
                    { "client_secret", settings.HubSpotClientSecret },
                    { "redirect_uri", getTokenParameters.RedirectUri },
                    { "code", getTokenParameters.Code },
                };

                var request = await httpClient.PostAsync("https://api.hubapi.com/oauth/v1/token", new FormUrlEncodedContent(formData));

                if (request.StatusCode == System.Net.HttpStatusCode.BadRequest)
                {
                    return new NotAuthenticatedResult();
                }

                var response = await request.Content.ReadAsAsync<GetTokenResponse>();

                accessToken = response.Access_token ?? throw new NotImplementedException("No access token from HubSpot.");

                hubSpotApiCache.CodeAccessTokenCache.Add(getTokenParameters.Code, accessToken);
            }

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            return new AuthenticatedResult();
        }

        public async Task<IEnumerable<dynamic>> GetForms()
        {
            var request = await httpClient.GetAsync("https://api.hubapi.com/forms/v2/forms");

            return await request.Content.ReadAsAsync<IEnumerable<dynamic>>();
        }
    }
}