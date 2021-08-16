using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Bases;

namespace SnapstatsOrg.Shared.GraphQL.Types.Bases
{
    public class BaseType : ObjectGraphType<Base>
    {
        public BaseType()
        {
            Field(f => f.date);
            Field(f => f.name);
            Field(f => f.count);
        }
    }
}
