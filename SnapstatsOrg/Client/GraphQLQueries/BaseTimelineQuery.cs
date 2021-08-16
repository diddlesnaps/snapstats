using SnapstatsOrg.Shared.Models;
using System;

namespace SnapstatsOrg.Client.GraphQLQueries
{
    public class BaseTimelineQuery
    {
        public Timeline[] baseTimeline { get; set; } = Array.Empty<Timeline>();
    }
}
