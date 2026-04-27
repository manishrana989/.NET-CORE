using System;

namespace minamev1.Models.DAL
{
    public class InvoiceReport
    {
        public int Id { get; set; }
        public string? ReportName { get; set; }
        public string? Member { get; set; }
        public int MemberId { get; set; }
        public string? PreviousBalance { get; set; }
        public string? CurrentBalance { get; set; }
        public string? PaymentMade { get; set; }
        public DateTime? DateOfPaymentMade { get; set; }
        public int SupportedMemberId { get; set; }
        public string? SupportedMember { get; set; }
        public int DependentMemberId { get; set; }
        public string? DependentMember { get; set; }
        public string? SupportingContribution { get; set; }
        public string? DependentContribution { get; set; }
        public string? DeceasedThisMonth { get; set; }
        public bool IsChurchMember { get; set; }  
        public int ?DeceasedCountMonth { get; set; }
        public int? DeceasedCountYTD { get; set; }
    }
}
