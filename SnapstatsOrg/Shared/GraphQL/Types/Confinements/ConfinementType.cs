using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Confinements;

namespace SnapstatsOrg.Shared.GraphQL.Types.Confinements
{
    public class ConfinementType : ObjectGraphType<Confinement>
    {
        public ConfinementType()
        {
            Field(f => f.date);
            Field(f => f.name);
            Field(f => f.count);
        }
    }
}
