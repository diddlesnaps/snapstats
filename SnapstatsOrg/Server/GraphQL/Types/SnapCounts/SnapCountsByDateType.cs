using GraphQL.Types;
using SnapstatsOrg.Shared.Models.SnapCounts;

namespace SnapstatsOrg.Server.GraphQL.Types.SnapCounts
{
    public class SnapCountsByDateType : ObjectGraphType<SnapCountByDate>
    {
        public SnapCountsByDateType()
        {
            Field(f => f._id);
            Field(f => f.snapCounts);
        }
    }
}
