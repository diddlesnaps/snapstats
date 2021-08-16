using System;

namespace SnapstatsOrg.Shared.Models.Channels
{
    public class ChannelByDate
    {
        public DateTime _id { get; set; }
        public Channel[] channels { get; set; } = Array.Empty<Channel>();
    }
}
