namespace SnapstatsOrg.Shared.Models
{
    public class Rating
    {
        public string app_id { get; set; } = "";
        public int star0 { get; set; }
        public int star1 { get; set; }
        public int star2 { get; set; }
        public int star3 { get; set; }
        public int star4 { get; set; }
        public int star5 { get; set; }
        public int total { get; set; }
    }
}
