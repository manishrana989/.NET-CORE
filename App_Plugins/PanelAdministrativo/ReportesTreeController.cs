using System;
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

    [Tree("PanelAdministrativo", /*alias*/"Reportes", TreeTitle = "Reportes", TreeGroup = "AdministracionGroup", SortOrder = 5)]
    [PluginController("PanelAdministrativo")]
    public class ReportesTreeController : TreeController
    {

        private readonly IMenuItemCollectionFactory _menuItemCollectionFactory;

        public ReportesTreeController(ILocalizedTextService localizedTextService,
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

            // check if we're rendering the root node's children
            if (id == Constants.System.Root.ToInvariantString())
            {

                var node = CreateTreeNode("Reportes", "-1", queryStrings, "Reportes", "icon-notepad-alt", false, "/PanelAdministrativo/Reportes/reportes/");
                nodes.Add(node);

            }

            return nodes;
        }

        protected override ActionResult<MenuItemCollection> GetMenuForNode(string id, FormCollection queryStrings)
        {
            // create a Menu Item Collection to return so people can interact with the nodes in your tree
            var menu = _menuItemCollectionFactory.Create();

            if (id == Constants.System.Root.ToInvariantString())
            {
                // root actions, perhaps users can create new items in this tree, or perhaps it's not a content tree, it might be a read only tree, or each node item might represent something entirely different...
                // add your menu item actions or custom ActionMenuItems
                menu.Items.Add(new CreateChildEntity(LocalizedTextService));
                // add refresh menu item (note no dialog)
                menu.Items.Add(new RefreshNode(LocalizedTextService, true));
            }
            else
            {
                // add a delete action to each individual item
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

            // set the icon
            root.Icon = "icon-notepad-alt";
            // could be set to false for a custom tree with a single node.
            root.HasChildren = true;
            //url for menu
            root.MenuUrl = null;

            return root;
        }
    }

}