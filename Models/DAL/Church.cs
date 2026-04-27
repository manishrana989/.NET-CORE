using System.Text.Json.Serialization;

namespace minamev1.Models.DAL
{
    public class Church
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? PhoneNumber { get; set; }
        public string? EmailAddress { get; set; }
        public string? Address { get; set; }
        public string? CoordinatorName { get; set; }
        public DateTime? CreatedDate { get; set; }
         public string? CoordinatorEmails { get; set; }
        public string? Members { get; set; }
        public string? MembersEmails { get; set; }

        public List<int> MemberIds { get; set; } = new List<int>();


    }
}
