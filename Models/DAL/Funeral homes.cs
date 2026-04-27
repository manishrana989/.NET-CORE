namespace minamev1.Models.DAL
{
    public class Funeral_homes
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Contract { get; set; }  
        public string? PhoneNumber { get; set; }
        public string? EmailAddress { get; set; }
        public decimal? PriceForService { get; set; }
        public string? DirectorName { get; set; }
        public string? FuneralHomeOwnerName { get; set; }
        public int MemberId { get; set; }
    }
}
