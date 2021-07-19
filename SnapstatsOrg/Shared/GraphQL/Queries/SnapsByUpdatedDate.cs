using SnapstatsOrg.Shared.Models;
using SnapstatsOrg.Shared.Models.Derived;

namespace SnapstatsOrg.Shared.GraphQL.Queries
{
    public class SnapsByUpdatedDate
    {
        public Pagination<Snap>? snapsByUpdatedDate { get; set; }
    }
}
