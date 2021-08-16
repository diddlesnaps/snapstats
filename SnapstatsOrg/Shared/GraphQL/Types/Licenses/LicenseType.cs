using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Licenses;

namespace SnapstatsOrg.Shared.GraphQL.Types.Licenses
{
    public class LicenseType : ObjectGraphType<License>
    {
        public LicenseType()
        {
            Field(f => f.date);
            Field(f => f.name);
            Field(f => f.count);
        }
    }
}
