using GraphQL.Types;
using SnapstatsOrg.Shared.Models;

namespace SnapstatsOrg.Shared.GraphQL.Types
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
