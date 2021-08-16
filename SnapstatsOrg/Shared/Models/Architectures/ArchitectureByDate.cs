using System;

namespace SnapstatsOrg.Shared.Models.Architectures
{
    public class ArchitectureByDate
    {
        public DateTime _id { get; set; }
        public Architecture[] architectures { get; set; } = Array.Empty<Architecture>();
    }
}
