using System;

namespace SnapstatsOrg.Shared.Models.SnapCounts
{
    public class SnapCountTimeline
    {
        public string? _id { get; set; }
        public int[] total { get; set; } = Array.Empty<int>();
        public int[] filtered { get; set; } = Array.Empty<int>();
    }
}
