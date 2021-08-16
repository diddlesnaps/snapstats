using GraphQL.Types;
using SnapstatsOrg.Shared.Models;

namespace SnapstatsOrg.Shared.GraphQL.Types.Architectures
{
    public class CountType : ObjectGraphType<Count>
    {
        public CountType()
        {
            Field(f => f.date);
            Field(f => f.count);
        }
    }
}
