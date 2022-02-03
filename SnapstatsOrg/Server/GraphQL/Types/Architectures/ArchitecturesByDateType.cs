using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Architectures;

namespace SnapstatsOrg.Server.GraphQL.Types.Architectures
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
