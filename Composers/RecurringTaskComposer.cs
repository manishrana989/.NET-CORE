using System;
using System.Net.Http;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Sync;
using Umbraco.Cms.Infrastructure.BackgroundJobs;
using Umbraco.Cms.Core.Logging;
using Microsoft.Extensions.Configuration;

namespace minamev1.BackgroundJobs
{
    public class RecurringTaskComposer : IRecurringBackgroundJob
    {
        public TimeSpan Period => TimeSpan.FromMinutes(30);

        public ServerRole[] ServerRoles => new[] { ServerRole.Single, ServerRole.Subscriber };

        public event EventHandler PeriodChanged { add { } remove { } }

        private readonly ILogger<RecurringTaskComposer> _logger;
        private readonly IContentService _contentService;
        private readonly ICoreScopeProvider _scopeProvider;
        private readonly HttpClient _httpClient;
        private readonly string _baseApiUrl;
        private readonly string _controllerUrl;
        private readonly IConfiguration _configuration;

        private bool _isRunning = false;

        public RecurringTaskComposer(
            ILogger<RecurringTaskComposer> logger,
            IContentService contentService,
            ICoreScopeProvider scopeProvider,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration)
        {
            _logger = logger;
            _contentService = contentService;
            _scopeProvider = scopeProvider;
            _httpClient = httpClientFactory.CreateClient();
            _configuration = configuration;
            _baseApiUrl = _configuration.GetValue<string>("minamev:BaseUrl");
            _controllerUrl = _configuration.GetValue<string>("minamev:ControllerUrl");
        }

        public async Task RunJobAsync()
        {
            if (_isRunning)
            {
                _logger.LogInformation("Job is already running, skipping this execution.");
                return;
            }

            _isRunning = true;

            try
            {
                _logger.LogInformation("Starting background job...");

                using (ICoreScope scope = _scopeProvider.CreateCoreScope())
                {
                    _logger.LogInformation("Content count: {0}", _contentService.Count());

                    var fullControllerUrl = $"{_baseApiUrl}{_controllerUrl}";

                    _logger.LogInformation("Calling API at: {FullControllerUrl}", fullControllerUrl);

                    var response = await _httpClient.GetAsync(fullControllerUrl);

                    if (response.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("API call succeeded: {0}", response.StatusCode);
                    }
                    else
                    {
                        _logger.LogWarning("API call failed: {0} - {1}", response.StatusCode, await response.Content.ReadAsStringAsync());
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during the background job.");
            }
            finally
            {
                _isRunning = false;
            }
        }
    }
}
