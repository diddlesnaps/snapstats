using System;
using MongoDB.Bson.Serialization.Attributes;

namespace SnapstatsOrg.Shared.Models.Sections
{
    [BsonIgnoreExtraElements]
    public class Section : ITimelineable
    {
        public string? name { get; set; }
        public int count { get; set; }
        public DateTime date { get; set; }
    }
}
