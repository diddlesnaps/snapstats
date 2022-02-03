using GraphQL.Types;
using SnapstatsOrg.Shared.Models.DeveloperCounts;

namespace SnapstatsOrg.Server.GraphQL.Types.DeveloperCounts
{
    public class DeveloperCountType : ObjectGraphType<DeveloperCount>
    {
        public DeveloperCountType()
        {
            Field(f => f.date);
            Field(f => f.total);
            Field(f => f.mean);
            Field(f => f.median);
            Field(f => f.mode);
        }
    }
}
