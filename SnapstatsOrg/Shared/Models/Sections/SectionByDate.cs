using System;

namespace SnapstatsOrg.Shared.Models.Sections
{
    public class SectionByDate
    {
        public DateTime _id { get; set; }
        public Section[] sections { get; set; } = Array.Empty<Section>();
    }
}
