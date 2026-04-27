using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
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
    [PluginController("Reports")]
    public class InvoiceReportController : UmbracoApiController
    {
        private readonly string _connectionString;
        private readonly IMemberService _memberService;
        private readonly ILogger<InvoiceReportController> _logger;

        public InvoiceReportController(IConfiguration configuration, IMemberService memberService, ILogger<InvoiceReportController> logger)
        {
            _connectionString = configuration.GetConnectionString("umbracoDbDSN");
            _memberService = memberService;
            _logger = logger;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InvoiceReport>>> GetInvoiceReports()
        {
            var reports = new List<InvoiceReport>();

            try
            {
                using (var conn = new SqlConnection(_connectionString))
                {
                    var cmd = new SqlCommand("GetAllInvoiceReports", conn)
                    {
                        CommandType = CommandType.StoredProcedure
                    };

                    await conn.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var memberId = reader["MemberId"] is DBNull ? 0 : (int)reader["MemberId"];
                            var member = _memberService.GetById(memberId);
                            var memberName = member != null ? member.Name : "Unknown Member";

                            var supoortMemberId = reader["SupportedMemberId"] is DBNull ? 0 : (int)reader["SupportedMemberId"];
                            var supoortMember = _memberService.GetById(supoortMemberId);
                            var supoortMembername = supoortMember != null ? supoortMember.Name : "Unknown Member";

                            var dependentMemberId = reader["DependentMemberId"] is DBNull ? 0 : (int)reader["DependentMemberId"];
                            var dependentMember = _memberService.GetById(dependentMemberId);
                            var dependentMembername = dependentMember != null ? dependentMember.Name : "Unknown Member";

                            var supportingContribution = reader["SupportingContribution"] is DBNull ? "0" : reader["SupportingContribution"].ToString();
                            var dependentContribution = reader["DependentContribution"] is DBNull ? "0" : reader["DependentContribution"].ToString();
                            var deceasedThisMonth = reader["DeceasedThisMonth"] is DBNull ? "0" : reader["DeceasedThisMonth"].ToString();
                            var isChurchMember = reader["IsChurchMember"] is DBNull ? false : (bool)reader["IsChurchMember"];
                            var deceasedCountMonth = reader["DeceasedCountMonth"] is DBNull ? 0 : (int)reader["DeceasedCountMonth"];
                            var deceasedCountYTD = reader["DeceasedCountYTD"] is DBNull ? 0 : (int)reader["DeceasedCountYTD"];

                            reports.Add(new InvoiceReport
                            {
                                Id = (int)reader["Id"],
                                ReportName = reader["ReportName"].ToString(),
                                MemberId = memberId,
                                Member = memberName,
                                SupportedMemberId = supoortMemberId,
                                SupportedMember = supoortMembername,
                                DependentMemberId = dependentMemberId,
                                DependentMember = dependentMembername,
                                PreviousBalance = reader["PreviousBalance"] != DBNull.Value ? reader["PreviousBalance"].ToString() : "0",
                                CurrentBalance = reader["CurrentBalance"] != DBNull.Value ? reader["CurrentBalance"].ToString() : "0",
                                PaymentMade = reader["PaymentMade"] != DBNull.Value ? reader["PaymentMade"].ToString() : "0",
                                DateOfPaymentMade = reader["DateOfPaymentMade"] != DBNull.Value ? (DateTime?)reader["DateOfPaymentMade"] : null,


                                SupportingContribution = supportingContribution,
                                DependentContribution = dependentContribution,
                                DeceasedThisMonth = deceasedThisMonth,
                                IsChurchMember = isChurchMember,
                                DeceasedCountMonth = deceasedCountMonth,
                                DeceasedCountYTD = deceasedCountYTD
                            });
                        }
                    }
                }

                return reports.Count > 0 ? Ok(reports) : NotFound("No invoice reports found.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching invoice reports.");
                return StatusCode(500, "An error occurred while fetching invoice reports.");
            }
        }


        [HttpGet]
        public async Task<ActionResult<InvoiceReport>> GetInvoiceReportById(int id)
        {
            try
            {
                using (var conn = new SqlConnection(_connectionString))
                {
                    var cmd = new SqlCommand("GetInvoiceReportById", conn)
                    {
                        CommandType = CommandType.StoredProcedure
                    };
                    cmd.Parameters.AddWithValue("@Id", id);

                    await conn.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            var memberId = (int)reader["MemberId"];
                            var member = _memberService.GetById(memberId);
                            var memberName = member != null ? member.Name : "Unknown Member";

                            var supportedmemberId = (int)reader["SupportedMemberId"];
                            var supportedmember = _memberService.GetById(supportedmemberId);
                            var supportedmembername = supportedmember != null ? supportedmember.Name : "Unknown Member";

                            var dependentmemberId = (int)reader["DependentMemberId"];
                            var dependentmember = _memberService.GetById(dependentmemberId);
                            var dependentmembername = dependentmember != null ? dependentmember.Name : "Unknown Member";

                            // New fields from database
                            var supportingContribution = reader["SupportingContribution"] is DBNull ? "0" : reader["SupportingContribution"].ToString();
                            var dependentContribution = reader["DependentContribution"] is DBNull ? "0" : reader["DependentContribution"].ToString();
                            var deceasedThisMonth = reader["DeceasedThisMonth"] is DBNull ? "0" : reader["DeceasedThisMonth"].ToString();
                            var isChurchMember = reader["IsChurchMember"] is DBNull ? false : (bool)reader["IsChurchMember"];
                            var deceasedCountMonth = reader["DeceasedCountMonth"] is DBNull ? 0 : (int)reader["DeceasedCountMonth"];
                            var deceasedCountYTD = reader["DeceasedCountYTD"] is DBNull ? 0 : (int)reader["DeceasedCountYTD"];

                            var report = new InvoiceReport
                            {
                                Id = (int)reader["Id"],
                                ReportName = reader["ReportName"].ToString(),
                                MemberId = memberId,
                                Member = memberName,
                                SupportedMemberId = supportedmemberId,
                                SupportedMember = supportedmembername,
                                DependentMemberId = dependentmemberId,
                                DependentMember = dependentmembername,
                                PreviousBalance = reader["PreviousBalance"] != DBNull.Value ? reader["PreviousBalance"].ToString() : "0",
                                CurrentBalance = reader["CurrentBalance"] != DBNull.Value ? reader["CurrentBalance"].ToString() : "0",
                                PaymentMade = reader["PaymentMade"] != DBNull.Value ? reader["PaymentMade"].ToString() : "0",
                                DateOfPaymentMade = reader["DateOfPaymentMade"] != DBNull.Value ? (DateTime?)reader["DateOfPaymentMade"] : null,

                                // Set new fields
                                SupportingContribution = supportingContribution,
                                DependentContribution = dependentContribution,
                                DeceasedThisMonth = deceasedThisMonth,
                                IsChurchMember = isChurchMember,
                                DeceasedCountMonth = deceasedCountMonth,
                                DeceasedCountYTD = deceasedCountYTD
                            };
                            return Ok(report);
                        }
                    }
                }

                return NotFound($"Invoice report with ID {id} not found.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching invoice report with ID {id}.");
                return StatusCode(500, "An error occurred while fetching the invoice report.");
            }
        }


        [HttpPost]
        public async Task<ActionResult> AddInvoiceReport(InvoiceReport report)
        {
            if (report == null)
                return BadRequest("InvoiceReport object is null.");

            try
            {
                var member = _memberService.GetById(report.MemberId);
                var supportMember = _memberService.GetById(report.SupportedMemberId);
                var dependentMember = _memberService.GetById(report.DependentMemberId);

      
                if (member != null)
                {
                    report.Member = member.Name;
                }
                else
                {
                    return BadRequest("Invalid MemberId provided.");
                }

                if (supportMember != null)
                {
                    report.SupportedMember = supportMember.Name;
                }
                else
                {
                    return BadRequest("Invalid SupportedMemberId provided.");
                }

                if (dependentMember != null)
                {
                    report.DependentMember = dependentMember.Name;
                }
                else
                {
                    return BadRequest("Invalid DependentMemberId provided.");
                }

                // Ensure default values for optional fields
                var supportingContribution = string.IsNullOrEmpty(report.SupportingContribution) ? "0" : report.SupportingContribution;
                var dependentContribution = string.IsNullOrEmpty(report.DependentContribution) ? "0" : report.DependentContribution;
                var deceasedThisMonth = string.IsNullOrEmpty(report.DeceasedThisMonth) ? "0" : report.DeceasedThisMonth;
                var isChurchMember = report.IsChurchMember ? 1 : 0;  
                var deceasedCountMonth = report.DeceasedCountMonth ?? 0;  
                var deceasedCountYTD = report.DeceasedCountYTD ?? 0;  

                using (var conn = new SqlConnection(_connectionString))
                {
                    var cmd = new SqlCommand("InsertInvoiceReport", conn)
                    {
                        CommandType = CommandType.StoredProcedure
                    };

                    cmd.Parameters.AddWithValue("@ReportName", report.ReportName);
                    cmd.Parameters.AddWithValue("@Member", report.Member);
                    cmd.Parameters.AddWithValue("@MemberId", report.MemberId);
                    cmd.Parameters.AddWithValue("@PreviousBalance", report.PreviousBalance);
                    cmd.Parameters.AddWithValue("@CurrentBalance", report.CurrentBalance);
                    cmd.Parameters.AddWithValue("@PaymentMade", report.PaymentMade ?? "0");  
                    cmd.Parameters.AddWithValue("@DateOfPaymentMade", report.DateOfPaymentMade.HasValue ? (object)report.DateOfPaymentMade.Value : DBNull.Value);
                    cmd.Parameters.AddWithValue("@SupportedMember", report.SupportedMember);
                    cmd.Parameters.AddWithValue("@SupportedMemberId", report.SupportedMemberId);
                    cmd.Parameters.AddWithValue("@DependentMember", report.DependentMember);
                    cmd.Parameters.AddWithValue("@DependentMemberId", report.DependentMemberId);

                    // New fields
                    cmd.Parameters.AddWithValue("@SupportingContribution", supportingContribution);
                    cmd.Parameters.AddWithValue("@DependentContribution", dependentContribution);
                    cmd.Parameters.AddWithValue("@DeceasedThisMonth", deceasedThisMonth);
                    cmd.Parameters.AddWithValue("@IsChurchMember", isChurchMember);
                    cmd.Parameters.AddWithValue("@DeceasedCountMonth", deceasedCountMonth);
                    cmd.Parameters.AddWithValue("@DeceasedCountYTD", deceasedCountYTD);

                    await conn.OpenAsync();
                    var rowsAffected = await cmd.ExecuteNonQueryAsync();

                    return rowsAffected > 0
                        ? CreatedAtAction(nameof(GetInvoiceReportById), new { id = report.Id }, report)
                        : BadRequest("Error adding InvoiceReport.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding invoice report.");
                return StatusCode(500, "An error occurred while adding the invoice report.");
            }
        }

    
        [HttpPut]
        public async Task<ActionResult> UpdateInvoiceReport(int id, InvoiceReport report)
        {
            if (report == null)
                return BadRequest("InvoiceReport object is null.");

      

            try
            {
           
                var member = _memberService.GetById(report.MemberId);
                var supportMember = _memberService.GetById(report.SupportedMemberId);
                var dependentMember = _memberService.GetById(report.DependentMemberId);

             
                if (member != null)
                {
                    report.Member = member.Name;
                }
                else
                {
                    return BadRequest("Invalid MemberId provided.");
                }

                if (supportMember != null)
                {
                    report.SupportedMember = supportMember.Name;
                }
                else
                {
                    return BadRequest("Invalid SupportedMemberId provided.");
                }

                if (dependentMember != null)
                {
                    report.DependentMember = dependentMember.Name;
                }
                else
                {
                    return BadRequest("Invalid DependentMemberId provided.");
                }

            
                var supportingContribution = string.IsNullOrEmpty(report.SupportingContribution) ? "0" : report.SupportingContribution;
                var dependentContribution = string.IsNullOrEmpty(report.DependentContribution) ? "0" : report.DependentContribution;
                var deceasedThisMonth = string.IsNullOrEmpty(report.DeceasedThisMonth) ? "0" : report.DeceasedThisMonth;
                var isChurchMember = report.IsChurchMember ? 1 : 0;
                var deceasedCountMonth = report.DeceasedCountMonth ?? 0;
                var deceasedCountYTD = report.DeceasedCountYTD ?? 0;


                using (var conn = new SqlConnection(_connectionString))
                {
                    var cmd = new SqlCommand("UpdateInvoiceReport", conn)
                    {
                        CommandType = CommandType.StoredProcedure
                    };

         
                    cmd.Parameters.AddWithValue("@Id", id);
                    cmd.Parameters.AddWithValue("@ReportName", report.ReportName);
                    cmd.Parameters.AddWithValue("@Member", report.Member);
                    cmd.Parameters.AddWithValue("@MemberId", report.MemberId);
                    cmd.Parameters.AddWithValue("@PreviousBalance", report.PreviousBalance);
                    cmd.Parameters.AddWithValue("@CurrentBalance", report.CurrentBalance);
                    cmd.Parameters.AddWithValue("@PaymentMade", report.PaymentMade);
                    cmd.Parameters.AddWithValue("@DateOfPaymentMade", report.DateOfPaymentMade.HasValue ? (object)report.DateOfPaymentMade.Value : DBNull.Value);
                    cmd.Parameters.AddWithValue("@SupportedMember", report.SupportedMember);
                    cmd.Parameters.AddWithValue("@SupportedMemberId", report.SupportedMemberId);
                    cmd.Parameters.AddWithValue("@DependentMember", report.DependentMember);
                    cmd.Parameters.AddWithValue("@DependentMemberId", report.DependentMemberId);
            
                    cmd.Parameters.Add(new SqlParameter("@SupportingContribution", SqlDbType.NVarChar, 255) { Value = supportingContribution });
                    cmd.Parameters.Add(new SqlParameter("@DependentContribution", SqlDbType.NVarChar, 255) { Value = dependentContribution });
                    cmd.Parameters.Add(new SqlParameter("@DeceasedThisMonth", SqlDbType.NVarChar, 255) { Value = deceasedThisMonth });
                    cmd.Parameters.Add(new SqlParameter("@IsChurchMember", SqlDbType.Bit) { Value = isChurchMember });
                    cmd.Parameters.Add(new SqlParameter("@DeceasedCountMonth", SqlDbType.Int) { Value = deceasedCountMonth });
                    cmd.Parameters.Add(new SqlParameter("@DeceasedCountYTD", SqlDbType.Int) { Value = deceasedCountYTD });


                    await conn.OpenAsync();
                    var rowsAffected = await cmd.ExecuteNonQueryAsync();

                    
                    return rowsAffected > 0
                        ? NoContent() 
                        : NotFound($"Invoice report with ID {id} not found.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating invoice report with ID {id}.");
                return StatusCode(500, "An error occurred while updating the invoice report.");
            }
        }



        [HttpDelete]
        public async Task<ActionResult> DeleteInvoiceReport(int id)
        {
            try
            {
                using (var conn = new SqlConnection(_connectionString))
                {
                    var cmd = new SqlCommand("DeleteInvoiceReport", conn)
                    {
                        CommandType = CommandType.StoredProcedure
                    };

                    cmd.Parameters.AddWithValue("@Id", id);

                    await conn.OpenAsync();
                    var rowsAffected = await cmd.ExecuteNonQueryAsync();

                    return rowsAffected > 0 ? NoContent() : NotFound($"Invoice report with ID {id} not found.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting invoice report with ID {id}.");
                return StatusCode(500, "An error occurred while deleting the invoice report.");
            }
        }
    }
}
