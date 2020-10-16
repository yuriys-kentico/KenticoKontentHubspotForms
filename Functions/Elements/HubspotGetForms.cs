using System;
using System.Threading.Tasks;

using Core.HubSpot.Models;
using Core.HubSpot.Services;

using Functions.Models;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

namespace Functions.Elements
{
    public partial class HubSpotGetForms : BaseFunction
    {
        private readonly IHubSpotRepository hubSpotRepository;

        public HubSpotGetForms(
            ILogger<HubSpotGetForms> logger,
            IHubSpotRepository hubSpotRepository
            ) : base(logger)
        {
            this.hubSpotRepository = hubSpotRepository;
        }

        [FunctionName(nameof(HubSpotGetForms))]
        public async Task<IActionResult> Run(
            [HttpTrigger(
                "post",
                Route = Routes.HubSpotGetForms
            )] GetFormsRequest getFormsRequest
            )
        {
            try
            {
                var (clientId, redirectUri, code) = getFormsRequest;

                await hubSpotRepository.Authenticate(new AuthenticateParameters
                {
                    ClientId = clientId,
                    RedirectUri = redirectUri,
                    Code = code
                });

                var forms = await hubSpotRepository.GetForms();

                return LogOkObject(new
                {
                    Forms = forms
                });
            }
            catch (Exception ex)
            {
                return LogException(ex);
            }
        }
    }
}