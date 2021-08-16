using GraphQL.Types;
using SnapstatsOrg.Shared.Models.SnapCounts;

namespace SnapstatsOrg.Shared.GraphQL.Types.SnapCounts
{
    public class SnapCountTimelineType : ObjectGraphType<SnapCountTimeline>
    {
        public SnapCountTimelineType()
        {
            Field(f => f._id);
            Field(f => f.total);
            Field(f => f.filtered);
        }
    }
}
