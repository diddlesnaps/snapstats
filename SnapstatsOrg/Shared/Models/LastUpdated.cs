using MongoDB.Bson.Serialization.Attributes;
using System;

namespace SnapstatsOrg.Shared.Models
{
    [BsonIgnoreExtraElements]
    public class LastUpdated
    {
        public DateTime date { get; set; }
    }
}
