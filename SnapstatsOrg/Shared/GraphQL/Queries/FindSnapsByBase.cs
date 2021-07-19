
using SnapstatsOrg.Shared.Models;
using SnapstatsOrg.Shared.Models.Derived;

namespace SnapstatsOrg.Shared.GraphQL.Queries
{
    public class FindSnapsByBase
    {
        public Pagination<Snap>? findSnapsByBase { get; set; }
    }
}
