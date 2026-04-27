using System;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Sections;
using Umbraco.Cms.Core.Dashboards;

namespace minamev1.App_Plugins.PanelAdministrativo
{
    public class SectionComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Sections().InsertBefore<ContentSection,PanelAdministrativoSection>();
            //builder.Dashboards().Remove<ContentDashboard>();
        }
    }
}

