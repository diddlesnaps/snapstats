using SnapstatsOrg.Shared.Models;
using SnapstatsOrg.Shared.Models.Derived;

namespace SnapstatsOrg.Shared.GraphQL.Queries
{
    public class FindSnapsByName
    {
        public Pagination<Snap>? findSnapsByName { get; set; }
    }
}
