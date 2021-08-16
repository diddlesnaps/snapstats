using System;

namespace SnapstatsOrg.Shared.Models
{
    public class Timeline
    {
        public string? _id { get; set; }
        public Count[] counts { get; set; } = Array.Empty<Count>();
    }
}
