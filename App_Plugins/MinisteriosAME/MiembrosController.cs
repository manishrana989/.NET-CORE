using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.Common.Attributes;

 
namespace minamev1.Controllers
{ 
        [PluginController("MinisteriosAME")]
        public class MiembrosController : UmbracoAuthorizedApiController
        {
            private readonly IMemberService _memberService;
            private readonly IMemberGroupService _memberGroupService;

        public MiembrosController(IMemberService memberService, IMemberGroupService memberGroupService)
            {
                _memberService = memberService;
                _memberGroupService = memberGroupService;

            }

            [HttpGet]
            public IActionResult GetMembers()
            {
              
              var members = _memberService.GetMembersByGroup("Sostenedor").Select(member => new
            {
                Id = member.Id,
                Name = member.Name,
                Email = member.Email
                // Add other properties as needed
            });

            return Ok(members);
        }



            [HttpGet]
            public IActionResult GetMember(int id) {

                var member = _memberService.GetById(id);

                return Ok(member);

            }



        }
    

}

