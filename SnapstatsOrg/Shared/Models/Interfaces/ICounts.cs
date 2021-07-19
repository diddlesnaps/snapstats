using System;

namespace SnapstatsOrg.Shared.Models.Interfaces
{
    public interface ICounts
    {
        public string? name { get; set; }
        public int count { get; set; }
        public DateTime date { get; set; }
    }
}
