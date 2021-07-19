using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Derived;

namespace SnapstatsOrg.Shared.GraphQL.Types
{
    public class TimelineCountsType : ObjectGraphType<TimelineCounts>
    {
        public TimelineCountsType()
        {
            Field(t => t.count);
            Field(t => t.date);
        }
    }

    public class TimelineType : ObjectGraphType<Timeline>
    {
        public TimelineType()
        {
            Field(t => t._id);
            Field(t => t.counts);
        }
    }
}
