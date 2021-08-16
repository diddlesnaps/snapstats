using MongoDB.Bson.Serialization.Attributes;
using System;

namespace SnapstatsOrg.Shared.Models.SnapCounts
{
    [BsonIgnoreExtraElements]
    public class SnapCount
    {
        public int total { get; set; }
        public int filtered { get; set; }
        public DateTime date { get; set; }
    }
}
