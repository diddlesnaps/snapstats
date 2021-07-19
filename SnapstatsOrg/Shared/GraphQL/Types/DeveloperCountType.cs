using GraphQL.Types;
using SnapstatsOrg.Shared.Models;

namespace SnapstatsOrg.Shared.GraphQL.Types
{
    public class DeveloperCountType : ObjectGraphType<DeveloperCount>
    {
        public DeveloperCountType()
        {
            Field(t => t.total);
            Field(t => t.mean);
            Field(t => t.median);
            Field(t => t.mode);
            Field(t => t.date);
        }
    }
}
