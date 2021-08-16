using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Channels;

namespace SnapstatsOrg.Shared.GraphQL.Types.Channels
{
    public class ChannelsByDateType : ObjectGraphType<ChannelByDate>
    {
        public ChannelsByDateType()
        {
            Field(f => f._id);
            Field(f => f.channels);
        }
    }
}
