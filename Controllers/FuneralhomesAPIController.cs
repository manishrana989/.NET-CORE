using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using minamev1.Models.DAL;
using Umbraco.Cms.Web.Common.Attributes;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Cms.Core.Services;

namespace minamev1.App_Plugins.Iglesias
{
    [PluginController("Funeral")]
    public class FuneralHomesController : UmbracoApiController
    {
        private readonly string _connectionString;
        private readonly IMemberService _memberService;

        public FuneralHomesController(IConfiguration configuration, IMemberService memberService)
        {
            _connectionString = configuration.GetConnectionString("umbracoDbDSN");
            _memberService = memberService;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Funeral_homes>>>GetFuneralHomes()
         {
            var funeralHomes = new List<Funeral_homes>();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("GetAllFuneralHomes", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                await conn.OpenAsync();
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                     {
                        funeralHomes.Add(new Funeral_homes
                        {
                            Id = (int)reader["Id"],
                            Name = reader["Name"].ToString(),
                            Contract = reader["Contract"].ToString(),
                            PhoneNumber = reader["PhoneNumber"].ToString(),
                            EmailAddress = reader["EmailAddress"].ToString(),
                            PriceForService = reader["PriceForService"] as decimal?,
                            DirectorName = reader["DirectorName"].ToString(),
                            FuneralHomeOwnerName = reader["FuneralHomeOwnerName"].ToString(),
                            MemberId = (int)reader["MemberId"]
                        });
                    }
                }
            }

            return Ok(funeralHomes);
        }

   
        [HttpGet]
        public async Task<ActionResult<Funeral_homes>> GetFuneralHomeById(int id)
        {
            Funeral_homes funeralHome = null;

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("GetFuneralHomeById", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };
                cmd.Parameters.AddWithValue("@Id", id);

                await conn.OpenAsync();
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        funeralHome = new Funeral_homes
                        {
                            Id = (int)reader["Id"],
                            Name = reader["Name"].ToString(),
                            Contract = reader["Contract"].ToString(),
                            PhoneNumber = reader["PhoneNumber"].ToString(),
                            EmailAddress = reader["EmailAddress"].ToString(),
                            PriceForService = reader["PriceForService"] as decimal?,
                            DirectorName = reader["DirectorName"].ToString(),
                            FuneralHomeOwnerName = reader["FuneralHomeOwnerName"].ToString(),
                            MemberId = (int)reader["MemberId"]
                        };
                    }
                }
            }

            if (funeralHome == null)
            {
                return NotFound();
            }

            return Ok(funeralHome);
        }

  
        [HttpPost]
        public async Task<ActionResult> AddFuneralHome(Funeral_homes funeralHome)
        {
            if (funeralHome == null)
            {
                return BadRequest("Funeral Home object is null.");
            }

            var member = _memberService.GetById(funeralHome.MemberId);
            if (member != null)
            {
                funeralHome.DirectorName = member.Name;
            }

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("AddFuneralHome", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                cmd.Parameters.AddWithValue("@Name", funeralHome.Name);
                cmd.Parameters.AddWithValue("@Contract", funeralHome.Contract);
                cmd.Parameters.AddWithValue("@PhoneNumber", funeralHome.PhoneNumber);
                cmd.Parameters.AddWithValue("@EmailAddress", funeralHome.EmailAddress);
                cmd.Parameters.AddWithValue("@PriceForService", funeralHome.PriceForService ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@DirectorName", funeralHome.DirectorName);
                cmd.Parameters.AddWithValue("@FuneralHomeOwnerName", funeralHome.FuneralHomeOwnerName);
                cmd.Parameters.AddWithValue("@MemberId", funeralHome.MemberId);

                await conn.OpenAsync();
                int rowsAffected = await cmd.ExecuteNonQueryAsync();

                if (rowsAffected > 0)
                {
                    return CreatedAtAction(nameof(GetFuneralHomeById), new { id = funeralHome.Id }, funeralHome);
                }
                else
                {
                    return BadRequest("Error adding funeral home.");
                }
            }
        }


        [HttpPut]
        public async Task<ActionResult> UpdateFuneralHome(int id, Funeral_homes funeralHome)
        {
            var member = _memberService.GetById(funeralHome.MemberId);
            if (member != null)
            {
                funeralHome.DirectorName = member.Name;
            }

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("UpdateFuneralHome", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                cmd.Parameters.AddWithValue("@Id", id);
                cmd.Parameters.AddWithValue("@Name", funeralHome.Name);
                cmd.Parameters.AddWithValue("@Contract", funeralHome.Contract);
                cmd.Parameters.AddWithValue("@PhoneNumber", funeralHome.PhoneNumber);
                cmd.Parameters.AddWithValue("@EmailAddress", funeralHome.EmailAddress);
                cmd.Parameters.AddWithValue("@PriceForService", funeralHome.PriceForService ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@DirectorName", funeralHome.DirectorName);
                cmd.Parameters.AddWithValue("@FuneralHomeOwnerName", funeralHome.FuneralHomeOwnerName);
                cmd.Parameters.AddWithValue("@MemberId", funeralHome.MemberId);

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

       
        [HttpDelete]
        public async Task<ActionResult> DeleteFuneralHome(int id)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("DeleteFuneralHome", conn)
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
    }
}
