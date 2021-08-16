using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Architectures;

namespace SnapstatsOrg.Shared.GraphQL.Types.Architectures
{
    public class ArchitecturesByDateType : ObjectGraphType<ArchitectureByDate>
    {
        public ArchitecturesByDateType()
        {
            Field(f => f._id);
            Field(f => f.architectures);
        }
    }
}
