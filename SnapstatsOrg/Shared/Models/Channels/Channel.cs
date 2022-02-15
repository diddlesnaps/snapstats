using System;
using MongoDB.Bson.Serialization.Attributes;

namespace SnapstatsOrg.Shared.Models.Channels
{
    [BsonIgnoreExtraElements]
    public class Channel : ITimelineable
    {
        public string? name { get; set; }
        public int count { get; set; }
        public DateTime date { get; set; }
    }
}
