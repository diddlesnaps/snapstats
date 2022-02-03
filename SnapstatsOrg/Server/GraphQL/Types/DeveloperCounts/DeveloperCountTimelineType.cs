using GraphQL.Types;
using SnapstatsOrg.Shared.Models.DeveloperCounts;

namespace SnapstatsOrg.Server.GraphQL.Types.DeveloperCounts
{
    public class DeveloperCountTimelineType : ObjectGraphType<DeveloperCountTimeline>
    {
        public DeveloperCountTimelineType()
        {
            Field(f => f._id);
            Field(f => f.total);
            Field(f => f.filtered);
        }
    }
}
