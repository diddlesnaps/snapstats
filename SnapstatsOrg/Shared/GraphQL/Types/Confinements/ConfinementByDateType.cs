using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Confinements;

namespace SnapstatsOrg.Shared.GraphQL.Types.Confinements
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
