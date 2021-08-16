using MongoDB.Bson.Serialization.Attributes;
using System;

namespace SnapstatsOrg.Shared.Models.DeveloperCounts
{
    [BsonIgnoreExtraElements]
    public class DeveloperCount
    {
        public int total { get; set; }
        public double mean { get; set; }
        public int median { get; set; }
        public int mode { get; set; }
        public DateTime date { get; set; }
    }
}
