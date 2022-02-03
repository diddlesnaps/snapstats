using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Bases;

namespace SnapstatsOrg.Server.GraphQL.Types.Bases
{
    public class BasesByDateType : ObjectGraphType<BaseByDate>
    {
        public BasesByDateType()
        {
            Field(f => f._id);
            Field(f => f.bases);
        }
    }
}
