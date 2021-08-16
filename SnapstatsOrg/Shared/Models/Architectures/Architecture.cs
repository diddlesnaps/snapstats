using MongoDB.Bson.Serialization.Attributes;
using System;

namespace SnapstatsOrg.Shared.Models.Architectures
{
    [BsonIgnoreExtraElements]
    public class Architecture
    {
        public string? name { get; set; }
        public int count { get; set; }
        public DateTime date { get; set; }
    }
}
