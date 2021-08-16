using SnapstatsOrg.Shared.Models;
using System;

namespace SnapstatsOrg.Client.GraphQLQueries
{
    public class ConfinementTimelineQuery
    {
        public Timeline[] confinementTimeline { get; set; } = Array.Empty<Timeline>();
    }
}
