using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Actions;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models.Trees;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Trees;
using Umbraco.Cms.Web.BackOffice.Trees;
using Umbraco.Cms.Web.Common.Attributes;
using Umbraco.Extensions;

namespace minamev1.App_Plugins.PanelAdministrativo
{
    [Tree("PanelAdministrativo", "Miembros", TreeTitle = "Miembro", TreeGroup = "AdministracionGroup", SortOrder = 2)]
    [PluginController("PanelAdministrativo")]
    public class MiembrosTreeController : TreeController
    {
        private readonly IMenuItemCollectionFactory _menuItemCollectionFactory;

        public MiembrosTreeController(ILocalizedTextService localizedTextService,
            UmbracoApiControllerTypeCollection umbracoApiControllerTypeCollection,
            IMenuItemCollectionFactory menuItemCollectionFactory,
            IEventAggregator eventAggregator)
            : base(localizedTextService, umbracoApiControllerTypeCollection, eventAggregator)
        {
            _menuItemCollectionFactory = menuItemCollectionFactory ?? throw new ArgumentNullException(nameof(menuItemCollectionFactory));
        }

        protected override ActionResult<TreeNodeCollection> GetTreeNodes(string id, FormCollection queryStrings)
        {
            var nodes = new TreeNodeCollection();

            if (id == Constants.System.Root.ToInvariantString())
            {
                // Node for all members
                nodes.Add(CreateTreeNode(
                    "Miembros",
                    "-1",
                    queryStrings,
                    "Miembros",
                    "icon-users",
                    false,
                    "PanelAdministrativo/Miembros/miembros/"
                ));

                // Node for specific group members
                nodes.Add(CreateTreeNode(
                    "Coordinadores",
                    "-1",
                    queryStrings,
                    "Coordinadores",
                    "icon-users-alt",
                    false,
                    "PanelAdministrativo/Miembros/Coordinadores/"
                ));
            }

            return nodes;
        }

        protected override ActionResult<MenuItemCollection> GetMenuForNode(string id, FormCollection queryStrings)
        {
            var menu = _menuItemCollectionFactory.Create();

            if (id == Constants.System.Root.ToInvariantString())
            {
                menu.Items.Add(new RefreshNode(LocalizedTextService, true));
            }
            else
            {
                menu.Items.Add<ActionDelete>(LocalizedTextService, true, opensDialog: true);
            }

            return menu;
        }

        protected override ActionResult<TreeNode?> CreateRootNode(FormCollection queryStrings)
        {
            var rootResult = base.CreateRootNode(queryStrings);
            if (!(rootResult.Result is null))
            {
                return rootResult;
            }

            var root = rootResult.Value;

            root.Icon = "icon-users";
            root.HasChildren = true;
            root.MenuUrl = null;

            return root;
        }






    }
}