using System;

namespace SnapstatsOrg.Shared.Models.Derived
{
    public class TimelineCounts
    {
        public int count { get; set; }
        public DateTime date { get; set; }
    }

    public class Timeline
    {
        public string? name { get; set; }
        //public TimelineCounts[]? counts { get; set; }
        public int count { get; set; }
        public DateTime date { get; set; }
    }
}
