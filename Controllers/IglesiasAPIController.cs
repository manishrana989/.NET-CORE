using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using minamev1.Models.DAL;
using Umbraco.Cms.Web.Common.Attributes;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.ModelsBuilder;

namespace minamev1.App_Plugins.Iglesias
{
    [PluginController("Church")]
    public class IglesiasController : UmbracoApiController
    {
        private readonly string _connectionString;
        private readonly IContentService _contentService;
        private readonly IMemberService _memberService;
        public IglesiasController(IConfiguration configuration, IContentService contentService, IMemberService memberService)
        {
            _connectionString = configuration.GetConnectionString("umbracoDbDSN");
            _memberService = memberService;
            _contentService = contentService;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Church>>> GetChurches()
        {
            var churches = new List<Church>();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("GetAllChurches", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                await conn.OpenAsync();
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        var memberIds = reader["MemberIds"] != DBNull.Value
                            ? reader["MemberIds"].ToString().Split(',').Select(int.Parse).ToList()
                            : new List<int>();

                        // Fetch coordinator names and emails
                        var coordinatorNames = new List<string>();
                        var coordinatorEmails = new List<string>();

                        foreach (var memberId in memberIds)
                        {
                            var member = _memberService.GetById(memberId);
                            if (member != null)
                            {
                                if (!string.IsNullOrEmpty(member.Name))
                                {
                                    coordinatorNames.Add(member.Name);
                                }
                                if (!string.IsNullOrEmpty(member.Email))
                                {
                                    coordinatorEmails.Add(member.Email);
                                }
                            }
                        }
                        churches.Add(new Church
                        {
                            Id = (int)reader["Id"],
                            Name = reader["Name"].ToString(),
                            PhoneNumber = reader["PhoneNumber"].ToString(),
                            EmailAddress = reader["EmailAddress"].ToString(),
                            Address = reader["Address"].ToString(),
                            CoordinatorName = string.Join(", ", coordinatorNames),
                            CoordinatorEmails = string.Join(", ", coordinatorEmails),
                            CreatedDate = (DateTime)reader["CreatedDate"],
                            MemberIds = memberIds
                        });
                    }
                }
            }

            return Ok(churches);
        }

        [HttpGet]
        public async Task<ActionResult<Church>> GetChurchById(int id)
        {
            Church church = null;

            try
            {
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("GetChurchById", conn)
                    {
                        CommandType = CommandType.StoredProcedure
                    };
                    cmd.Parameters.AddWithValue("@Id", id);

                    await conn.OpenAsync();
                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            var memberIds = reader["MemberIds"] != DBNull.Value
                                ? reader["MemberIds"].ToString().Split(',').Select(int.Parse).ToList()
                                : new List<int>();

                            // Fetch all members and determine if they are coordinators
                            var allMembers = memberIds
                                .Select(memberId =>
                                {
                                    var member = _memberService.GetById(memberId);
                                    return member != null ? new
                                    {
                                        member.Name,
                                        member.Email,
                                        IsCoordinator = member.GetValue<bool>("memberCoordinator")
                                    } : null;
                                })
                                .Where(member => member != null)
                                .ToList();                      
                            var coordinatorNames = string.Join(", ", allMembers.Where(c => c.IsCoordinator).Select(c => c.Name));
                            var coordinatorEmails = string.Join(", ", allMembers.Where(c => c.IsCoordinator).Select(c => c.Email));
                            var memberNames = string.Join(", ", allMembers.Where(c => !c.IsCoordinator).Select(c => c.Name));
                            var memberEmails = string.Join(", ", allMembers.Where(c => !c.IsCoordinator).Select(c => c.Email));
                            var combinedMemberNames = string.Join(", ", allMembers.Select(c => c.Name));
                            var combinedMemberEmails = string.Join(", ", allMembers.Select(c => c.Email));

                            church = new Church
                            {
                                Id = (int)reader["Id"],
                                Name = reader["Name"].ToString(),
                                PhoneNumber = reader["PhoneNumber"].ToString(),
                                EmailAddress = reader["EmailAddress"].ToString(),
                                Address = reader["Address"].ToString(),
                                CoordinatorName = coordinatorNames,
                                CoordinatorEmails = coordinatorEmails,
                                Members = combinedMemberNames,  // Include all members (coordinators + non-coordinators)
                                MembersEmails = combinedMemberEmails,  // Include all members' emails
                                CreatedDate = (DateTime)reader["CreatedDate"],
                                MemberIds = memberIds
                            };
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Exception while fetching church: {ex.Message}");
                return NotFound();
            }

            if (church == null)
            {
                return NotFound();
            }

            return Ok(church);
        }








        [HttpPost]
        public async Task<ActionResult> AddChurch(Church church)
        {
            try
            {
                if (church == null)
                {
                    return BadRequest("Church data is required.");
                }

                var coordinatorNames = new List<string>();
                var allChurchesToAdd = new List<string>(); 

         
                foreach (var memberId in church.MemberIds)
                {
                    var member = _memberService.GetById(memberId);
                    if (member != null)
                    {
                        coordinatorNames.Add(member.Name);

                        var existingChurchesString = member.GetValue<string>("church");
                        var existingChurches = string.IsNullOrEmpty(existingChurchesString)
                            ? new List<string>()
                            : existingChurchesString.Split(new[] { Environment.NewLine }, StringSplitOptions.None).ToList();  

                        
                        existingChurches.Add(church.Name);

                     
                        var updatedChurchesString = string.Join(Environment.NewLine, existingChurches); 
                        member.SetValue("church", updatedChurchesString);
                        _memberService.Save(member);

                  
                        allChurchesToAdd.Add(church.Name);
                    }
                }
             
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("AddChurch", conn)
                    {
                        CommandType = CommandType.StoredProcedure
                    };

                    cmd.Parameters.AddWithValue("@Name", church.Name);
                    cmd.Parameters.AddWithValue("@PhoneNumber", church.PhoneNumber);
                    cmd.Parameters.AddWithValue("@EmailAddress", church.EmailAddress);
                    cmd.Parameters.AddWithValue("@Address", church.Address);
                    cmd.Parameters.AddWithValue("@Members", string.Join(", ", coordinatorNames)); 
                    cmd.Parameters.AddWithValue("@CreatedDate", DateTime.Now);
                    cmd.Parameters.AddWithValue("@MemberIds", string.Join(",", church.MemberIds)); 

                    await conn.OpenAsync();
                    int rowsAffected = await cmd.ExecuteNonQueryAsync();

                    if (rowsAffected > 0)
                    {
                        return CreatedAtAction(nameof(GetChurchById), new { id = church.Id }, church);
                    }
                    else
                    {
                        Console.Error.WriteLine($"Error adding church: {church.Name}.");
                        return BadRequest("Error adding church.");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Exception while adding church: {ex.Message}");
                return StatusCode(500, "Internal server error. Please try again later.");
            }
        }
      
        [HttpPut]
        public async Task<ActionResult> UpdateChurch(int id, Church church)
        {
            try
            {
                Church churchToUpdate = null;

                // Fetch all church details from the database
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("GetChurchById", conn)
                    {
                        CommandType = CommandType.StoredProcedure
                    };
                    cmd.Parameters.AddWithValue("@Id", id);

                    await conn.OpenAsync();
                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            var memberIds = reader["MemberIds"] != DBNull.Value
                                ? reader["MemberIds"].ToString().Split(',').Select(int.Parse).ToList()
                                : new List<int>();

                            // Fetch other details of the church
                            churchToUpdate = new Church
                            {
                                Id = (int)reader["Id"],
                                Name = reader["Name"].ToString(),
                                PhoneNumber = reader["PhoneNumber"].ToString(),
                                EmailAddress = reader["EmailAddress"].ToString(),
                                Address = reader["Address"].ToString(),
                                CoordinatorName = reader["Members"] != DBNull.Value ? reader["Members"].ToString() : string.Empty,
                                MemberIds = reader["MemberIds"] != DBNull.Value
                                    ? reader["MemberIds"].ToString().Split(',').Select(int.Parse).ToList()
                                    : new List<int>()
                            };
                        }
                    }
                }

                if (churchToUpdate == null)
                {
                    return NotFound();
                }

                var coordinatorNames = new List<string>();

       
                foreach (var memberId in church.MemberIds)
                {
                    var member = _memberService.GetById(memberId);
                    if (member != null)
                    {
                        coordinatorNames.Add(member.Name);  

                        var existingChurchesString = member.GetValue<string>("church");
                        var existingChurches = string.IsNullOrWhiteSpace(existingChurchesString)
                            ? new List<string>()
                            : existingChurchesString.Split(new[] { Environment.NewLine }, StringSplitOptions.None).ToList();

                        existingChurches.RemoveAll(c => c.Equals(churchToUpdate.Name, StringComparison.OrdinalIgnoreCase));
                        if (!existingChurches.Contains(church.Name, StringComparer.OrdinalIgnoreCase))
                        {
                            existingChurches.Add(church.Name);
                        }

                     
                        member.SetValue("church", string.Join(Environment.NewLine, existingChurches));

                        _memberService.Save(member);
                    }
                }

             
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("UpdateChurch", conn)
                    {
                        CommandType = CommandType.StoredProcedure
                    };
                    cmd.Parameters.AddWithValue("@Id", id);
                    cmd.Parameters.AddWithValue("@Name", church.Name);
                    cmd.Parameters.AddWithValue("@PhoneNumber", church.PhoneNumber);
                    cmd.Parameters.AddWithValue("@EmailAddress", church.EmailAddress);
                    cmd.Parameters.AddWithValue("@Address", church.Address);
                    cmd.Parameters.AddWithValue("@Members", coordinatorNames.Any() ? string.Join(", ", coordinatorNames) : "");

                    cmd.Parameters.AddWithValue("@MemberIds", string.Join(",", church.MemberIds));

                    await conn.OpenAsync();
                    int rowsAffected = await cmd.ExecuteNonQueryAsync();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpDelete]
        public async Task<ActionResult> DeleteChurch(int id)
        {
            try
            {
                Church churchToDelete = null;

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("GetChurchById", conn)
                    {
                        CommandType = CommandType.StoredProcedure
                    };
                    cmd.Parameters.AddWithValue("@Id", id);

                    await conn.OpenAsync();
                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            var memberIds = reader["MemberIds"] != DBNull.Value
                                ? reader["MemberIds"].ToString().Split(',').Select(int.Parse).ToList()
                                : new List<int>();

                            churchToDelete = new Church
                            {
                                Id = (int)reader["Id"],
                                Name = reader["Name"].ToString(),
                                MemberIds = memberIds
                            };
                        }
                    }
                }

                if (churchToDelete == null)
                {
                    return NotFound(); 
                }

               
                foreach (var memberId in churchToDelete.MemberIds)
                {
                    var member = _memberService.GetById(memberId);
                    if (member != null)
                    {
                        var existingChurchesString = member.GetValue<string>("church");

                        if (string.IsNullOrWhiteSpace(existingChurchesString))
                        {
                            continue;
                        }

                        
                        var updatedChurches = existingChurchesString
                            .Split(new[] { Environment.NewLine }, StringSplitOptions.None)
                            .Where(church => church != churchToDelete.Name) 
                            .ToList();

                        var updatedChurchesString = string.Join(Environment.NewLine, updatedChurches); 
                        member.SetValue("church", updatedChurchesString);

                        
                        _memberService.Save(member);
                    }
                }

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("DeleteChurch", conn)
                    {
                        CommandType = CommandType.StoredProcedure
                    };

                    cmd.Parameters.AddWithValue("@Id", id);

                    await conn.OpenAsync();
                    int rowsAffected = await cmd.ExecuteNonQueryAsync();

                    if (rowsAffected > 0)
                    {
                        return NoContent(); 
                    }
                    else
                    {
                        return NotFound(); 
                    }
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Exception while deleting church: {ex.Message}");
                return StatusCode(500, "Internal server error. Please try again later.");
            }
        }

    }
}
