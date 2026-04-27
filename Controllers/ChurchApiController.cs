using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.Common.Attributes;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace minamev1.Controllers
{
    [PluginController("Administracion")]
    public class ChurchApiController : UmbracoAuthorizedApiController
    {
        private readonly IContentService _contentService;
        private readonly IContentTypeService _contentTypeService;

        public ChurchApiController(IContentService contentService,  IContentTypeService contentTypeService)
        {
            _contentService = contentService;
            _contentTypeService = contentTypeService;
        }

        [HttpGet]
        public IActionResult GetChurches()
        {
           
            var allContent = _contentService.GetRootContent();

           
            var churches = allContent.Where(x => x.ContentType.Alias.Equals("church")).Select(church => new
            {
                Id = church.Id,
                Name = church.Name,
               
            });

            return Ok(churches);
        }


        [HttpGet]
        public IActionResult GetChurch(int id)
        {

            var church = _contentService.GetById(id);

            return Ok(church);
        }


    }
}

