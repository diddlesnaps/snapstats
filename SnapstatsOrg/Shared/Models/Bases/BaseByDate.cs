using System;

namespace SnapstatsOrg.Shared.Models.Bases
{
    public class BaseByDate
    {
        public DateTime _id { get; set; }
        public Base[] bases { get; set; } = Array.Empty<Base>();
    }
}
