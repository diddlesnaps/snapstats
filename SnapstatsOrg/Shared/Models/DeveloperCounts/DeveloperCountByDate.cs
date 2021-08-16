using System;

namespace SnapstatsOrg.Shared.Models.DeveloperCounts
{
    public class DeveloperCountByDate
    {
        public DateTime _id { get; set; }
        public DeveloperCount[] developerCounts { get; set; } = Array.Empty<DeveloperCount>();
    }
}
