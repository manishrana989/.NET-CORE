using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Trees;
using Umbraco.Cms.Web.BackOffice.Trees;
using Umbraco.Cms.Web.Common.Attributes;
using Umbraco.Cms.Web.Common.ModelBinders;

[Tree("adminSection", "adminTree", TreeTitle = "Administration")]
[PluginController("adminSection")]
public class AdminTreeController : TreeController
{
    private readonly IMemberService _memberService;
    private readonly IMenuItemCollectionFactory _menuItemCollectionFactory;

    public AdminTreeController(ILocalizedTextService localizedTextService,
         UmbracoApiControllerTypeCollection umbracoApiControllerTypeCollection,
         IMenuItemCollectionFactory menuItemCollectionFactory,
         IEventAggregator eventAggregator,
         IMemberService memberService)
         : base(localizedTextService, umbracoApiControllerTypeCollection, eventAggregator)
    {
        _menuItemCollectionFactory = menuItemCollectionFactory ?? throw new ArgumentNullException(nameof(menuItemCollectionFactory));
        _memberService = memberService ?? throw new ArgumentNullException(nameof(memberService));
    }

    protected override ActionResult<TreeNodeCollection> GetTreeNodes(string id, [ModelBinder(typeof(HttpQueryStringModelBinder))] FormCollection queryStrings)
    {
        var nodes = new TreeNodeCollection();

        if (id == Constants.System.Root.ToInvariantString())
        {
            // Root node
            nodes.Add(CreateTreeNode("members", id, queryStrings, "Members", "icon-user", false,
                routePath: "/App_Plugins/adminSection/members.html"));
        }

        return nodes;
    }

    protected override ActionResult<MenuItemCollection> GetMenuForNode(string id, [ModelBinder(typeof(HttpQueryStringModelBinder))] FormCollection queryStrings)
    {
        return null;
    }
}
