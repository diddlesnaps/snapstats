using System;

namespace SnapstatsOrg.Shared.Models.SnapCounts
{
    public class SnapCountByDate
    {
        public DateTime _id { get; set; }
        public SnapCount[] snapCounts { get; set; } = Array.Empty<SnapCount>();
    }
}
