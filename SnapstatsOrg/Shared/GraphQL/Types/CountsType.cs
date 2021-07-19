using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Interfaces;

namespace SnapstatsOrg.Shared.GraphQL.Types
{
    public class CountsType: ObjectGraphType<ICounts>
    {
        public CountsType()
        {
            Field(t => t.name);
            Field(t => t.date);
            Field(t => t.count);
        }
    }
}
