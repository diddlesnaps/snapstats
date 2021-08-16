using SnapstatsOrg.Shared.Models;
using System;

namespace SnapstatsOrg.Client.GraphQLQueries
{
    public class ChannelTimelineQuery
    {
        public Timeline[] channelTimeline { get; set; } = Array.Empty<Timeline>();
    }
}
