using SnapstatsOrg.Shared.Models;
using System;

namespace SnapstatsOrg.Client.GraphQLQueries
{
    public class ArchitectureTimelineQuery
    {
        public Timeline[] architectureTimeline { get; set; } = Array.Empty<Timeline>();
    }
}
