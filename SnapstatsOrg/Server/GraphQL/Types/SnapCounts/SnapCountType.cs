using GraphQL.Types;
using SnapstatsOrg.Shared.Models.SnapCounts;

namespace SnapstatsOrg.Server.GraphQL.Types.SnapCounts
{
    public class SnapCountType : ObjectGraphType<SnapCount>
    {
        public SnapCountType()
        {
            Field(f => f.date);
            Field(f => f.total);
            Field(f => f.filtered);
        }
    }
}
