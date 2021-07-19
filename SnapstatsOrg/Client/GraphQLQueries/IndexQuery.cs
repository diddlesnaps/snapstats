using SnapstatsOrg.Shared.Models;
using SnapstatsOrg.Shared.Models.Derived;

namespace SnapstatsOrg.Client.GraphQLQueries
{
    public class IndexQuery
    {
        public SnapCount[]? snapCountsByDate { get; set; }
        public DeveloperCount[]? developerCountsByDate { get; set; }
        public Pagination<Snap>? snapsByDate { get; set; }
        public uint? findSnapsCount { get; set; }
        public uint? verifiedDeveloperCount { get; set; }
    }
}
