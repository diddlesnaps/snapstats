using System;

namespace SnapstatsOrg.Shared.Models.DeveloperCounts
{
    public class DeveloperCountTimeline
    {
        public string? _id { get; set; }
        public int[] total { get; set; } = Array.Empty<int>();
        public int[] filtered { get; set; } = Array.Empty<int>();
    }
}
