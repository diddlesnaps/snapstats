using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Architectures;

namespace SnapstatsOrg.Shared.GraphQL.Types.Architectures
{
    public class ArchitectureType : ObjectGraphType<Architecture>
    {
        public ArchitectureType()
        {
            Field(f => f.date);
            Field(f => f.name);
            Field(f => f.count);
        }
    }
}
