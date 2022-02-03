using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Confinements;

namespace SnapstatsOrg.Server.GraphQL.Types.Confinements
{
    public class ConfinementsByDateType : ObjectGraphType<ConfinementByDate>
    {
        public ConfinementsByDateType()
        {
            Field(f => f._id);
            Field(f => f.confinements);
        }
    }
}
