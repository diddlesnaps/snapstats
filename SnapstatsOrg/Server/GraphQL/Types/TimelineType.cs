using GraphQL.Types;
using SnapstatsOrg.Shared.Models;

namespace SnapstatsOrg.Server.GraphQL.Types
{
    public class TimelineType : ObjectGraphType<Timeline>
    {
        public TimelineType()
        {
            Field(f => f._id);
            Field(f => f.counts);
        }
    }
}
