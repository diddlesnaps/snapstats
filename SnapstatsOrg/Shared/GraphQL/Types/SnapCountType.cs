using GraphQL.Types;
using SnapstatsOrg.Shared.Models;

namespace SnapstatsOrg.Shared.GraphQL.Types
{
    public class SnapCountType: ObjectGraphType<SnapCount>
    {
        public SnapCountType()
        {
            Field(t => t.total);
            Field(t => t.filtered);
            Field(t => t.date);
        }
    }
}
