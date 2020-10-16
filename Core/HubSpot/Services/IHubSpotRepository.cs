using System.Collections.Generic;
using System.Threading.Tasks;

using Core.HubSpot.Models;

namespace Core.HubSpot.Services
{
    public interface IHubSpotRepository
    {
        Task Authenticate(AuthenticateParameters getTokenParameters);

        Task<IEnumerable<dynamic>> GetForms();
    }
}