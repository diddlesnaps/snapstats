using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Licenses;

namespace SnapstatsOrg.Server.GraphQL.Types.Licenses
{
    public class LicensesByDateType : ObjectGraphType<LicenseByDate>
    {
        public LicensesByDateType()
        {
            Field(f => f._id);
            Field(f => f.licenses);
        }
    }
}
