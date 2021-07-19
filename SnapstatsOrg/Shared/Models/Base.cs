using System;
using SnapstatsOrg.Shared.Models.Interfaces;

namespace SnapstatsOrg.Shared.Models
{
    public class Base : ICounts
    {
        public string? name { get; set; }
        public int count { get; set; }
        public DateTime date { get; set; }
    }
}
