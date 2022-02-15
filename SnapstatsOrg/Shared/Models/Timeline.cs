using System;

namespace SnapstatsOrg.Shared.Models
{
    public interface ITimelineable {
        DateTime date { get; set; }
        string name { get; set; }
        int count { get; set; }
    }

    public class Timeline
    {
        public string? _id { get; set; }
        public Count[] counts { get; set; } = Array.Empty<Count>();
    }
}
