using MongoDB.Bson.Serialization.Attributes;
using System;

namespace SnapstatsOrg.Shared.Models.Bases
{
    [BsonIgnoreExtraElements]
    public class Base : ITimelineable
    {
        public string? name { get; set; }
        public int count { get; set; }
        public DateTime date { get; set; }
    }
}
