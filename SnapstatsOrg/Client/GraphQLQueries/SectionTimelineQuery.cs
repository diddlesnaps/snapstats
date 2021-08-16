using SnapstatsOrg.Shared.Models;
using System;

namespace SnapstatsOrg.Client.GraphQLQueries
{
    public class SectionTimelineQuery
    {
        public Timeline[] sectionTimeline { get; set; } = Array.Empty<Timeline>();
    }
}
