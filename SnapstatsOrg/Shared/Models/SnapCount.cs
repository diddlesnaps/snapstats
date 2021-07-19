using System;

namespace SnapstatsOrg.Shared.Models
{
    public class SnapCount
    {
        public int total { get; set; }
        public int filtered { get; set; }
        public DateTime date { get; set; }
    }
}
