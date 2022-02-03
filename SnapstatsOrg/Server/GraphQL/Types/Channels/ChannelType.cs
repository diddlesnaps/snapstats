using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Channels;

namespace SnapstatsOrg.Server.GraphQL.Types.Channels
{
    public class ChannelType : ObjectGraphType<Channel>
    {
        public ChannelType()
        {
            Field(f => f.date);
            Field(f => f.name);
            Field(f => f.count);
        }
    }
}
