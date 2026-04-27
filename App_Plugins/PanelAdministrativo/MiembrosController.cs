using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.Common.Attributes;
using Umbraco.Extensions;

namespace minamev1.App_Plugins.PanelAdministrativo
{
    [PluginController("PanelAdministrativo")]
    public class MiembrosController : UmbracoAuthorizedApiController
    {
        private readonly IMemberService _memberService;
        private readonly IMemberGroupService _memberGroupService;
        private readonly IContentService _contentService;
        private readonly IMemberTypeService _memberTypeService;

        public MiembrosController(IMemberService memberService, IMemberGroupService memberGroupService, IContentService contentService,
            IMemberTypeService memberTypeService)
        {
            _memberService = memberService;
            _memberGroupService = memberGroupService;
            _contentService = contentService;
            _memberTypeService = memberTypeService;
        }

        // Updated GetMembers method with handling of MemberIsCoordinator
        [HttpGet]
        public IActionResult GetMembers()
        {
            var allMembers = _memberService.GetAllMembers().ToList();
            var dependentMembers = _memberService.GetMembersByMemberType("miembroDepende").ToList();
            var supportedMembers = _memberService.GetMembersByMemberType("miembroSostenedor").ToList();

            var members = allMembers.Select(member => new
            {
                Id = member.Id,
                Name = member.Name,
                Email = member.Email,
                MemberIsCoordinator = member.GetValue<bool>("memberCoordinator"), // Fetch MemberIsCoordinator property
                Bautizado = member.GetValue<bool>("memberBautisado"),
                Amigo = member.GetValue<bool>("memberAmigo"),
                MemberType = member.GetValue<string>("memberType"),
                Country = member.GetValue<string>("miembroSostenedorPais")
            }).ToList();

            var dependents = dependentMembers.Select(depende => new
            {
                Id = depende.Id,
                Name = depende.Name,
                IsMinor = depende.GetValue<bool>("miembroIsMinor")
            }).ToList();

            var supportingMembers = supportedMembers.Select(support => new
            {
                Id = support.Id,
                Name = support.Name,
                SupportedMember = support.GetValue<string>("miembroSostenedorPais")
            }).ToList();

            var result = new
            {
                Members = members,
                TotalMembers = members.Count,
                TotalBautizado = members.Count(m => m.Bautizado),
                TotalAmigo = members.Count(m => m.Amigo),
                TotalCoordinators = members.Count(m => m.MemberIsCoordinator), // Count coordinators
                TotalDependents = dependents.Count,
                TotalMinors = dependents.Count(d => d.IsMinor),
                TotalSustaining = members.Count(m => m.MemberType == "Regular" || m.MemberType == "Honorary Member"),
                TotalUSA = members.Count(m => m.Country == "[\"USA\"]"),
                TotalDR = members.Count(m => m.Country == "[\"Republica Dominicana\"]"),
                TotalPR = members.Count(m => m.Country == "[\"Puerto Rico\"]"),
                SupportedMembers = supportingMembers,
                DependentMembers = dependents
            };

            return Ok(result);
        }

        // Updated GetMember method with detailed coordinator info
        [HttpGet]
        public IActionResult GetMember(int id)
        {
            var member = _memberService.GetById(id);

            var alias = member.ContentTypeAlias;

            if (alias == "miembroDepende")
            {
                MemberViewModel miembroDepende = new MemberViewModel()
                {
                    Id = member.Id,
                    Name = member.GetValue<string>("miembroDependeNombre"),
                    LName = member.GetValue<string>("miembroDependeApellido"),
                    Church = member.GetValue<string>("church")
                };

                return Ok(miembroDepende);
            }

            var dateOfBirth = member.GetValue<DateTime>("memberDateOfBirth");
            var memberDateBegan = member.GetValue<DateTime>("memberDateBegan");

            var dateOfBirthFormatted = dateOfBirth.ToString("MM-dd-yyyy");
            var memberDateBeganFormatted = memberDateBegan.ToString("MM-dd-yyyy");

            var churchID = member.GetValue<Udi>("miemberoSostenedorIglesia");
            var churchUdi = member.GetValue<GuidUdi>("miemberoSostenedorIglesia");

            IContent church = null;

            var dependesString = member.GetValue<string>("miembroSostenedorDependes");
            var udiStrings = dependesString?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();

            var dependeGuids = new List<Guid>();
            var dependents = new List<IMember>();

            foreach (var udiString in udiStrings)
            {
                var trimmedUdi = udiString.Trim();
                if (trimmedUdi.StartsWith("umb://member/"))
                {
                    var guidPart = trimmedUdi.Substring("umb://member/".Length);
                    if (Guid.TryParse(guidPart, out var guid))
                    {
                        dependeGuids.Add(guid);

                        var dm = _memberService.GetByKey(guid);
                        dependents.Add(dm);
                    }
                }
            }

            MemberViewModel miembro = new MemberViewModel()
            {
                Id = member.Id,
                Name = member.GetValue<string>("miembroSostenedorNombre"),
                LName = member.GetValue<string>("miembroSostenedorApellido"),
                Address = member.GetValue<string>("miembroSostenedorDireccion"),
                Country = member.GetValue<string>("miembroSostenedorPais"),
                Phone = member.GetValue<string>("memberPhone"),
                DateOfBirth = dateOfBirthFormatted,
                Email = member.GetValue<string>("miembroSostenedorCorreo"),
                MemberType = member.GetValue<string>("memberType"),
                MemberStatus = member.GetValue<string>("memberStatus"),
                Photo = member.GetValue<MediaWithCrops>("memberImage"),
                MemberNotes = member.GetValue<string>("memberNotes"),
                AuthorizedPersons = member.GetValue<string>("memberAuthorizedPersons"),
                MemberClassification = member.GetValue<string>("memberClassification"),
                MemberConvalescent = member.GetValue<bool>("memberConvalescent"),
                MemberIsCoordinator = member.GetValue<bool>("memberCoordinator"), // Include the coordinator status
                DateMembershipBegan = memberDateBeganFormatted,
                ContributionType = member.GetValue<string>("memberContributionType"),
                Church = member.GetValue<string>("church"),
                Dependes = dependents
            };

            return Ok(miembro);
        }
    }

    // MemberViewModel class remains the same but can optionally add the "MemberIsCoordinator" field
    public class MemberViewModel
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? LName { get; set; }
        public string? Address { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
        public string? DateOfBirth { get; set; }
        public string? Email { get; set; }
        public string? MemberType { get; set; }
        public string? MemberStatus { get; set; }
        public MediaWithCrops? Photo { get; set; }
        public string? MemberNotes { get; set; }
        public string? AuthorizedPersons { get; set; }
        public string? MemberClassification { get; set; }
        public bool? MemberConvalescent { get; set; }
        public bool? MemberIsCoordinator { get; set; } // Added the coordinator field
        public string? DateMembershipBegan { get; set; }
        public string? ContributionType { get; set; }
        public string? Church { get; set; }
        public IEnumerable? Dependes { get; set; }
        public IEnumerable? Invoices { get; set; }
        public bool? Bautizado { get; set; }
        public bool? Amigo { get; set; }
    }
}
