using SnapstatsOrg.Shared.Models;
using SnapstatsOrg.Shared.Models.Derived;

namespace SnapstatsOrg.Shared.GraphQL.Queries
{
    public class FindSnaps
    {
        public Pagination<Snap>? findSnaps { get; set; }
    }
}
