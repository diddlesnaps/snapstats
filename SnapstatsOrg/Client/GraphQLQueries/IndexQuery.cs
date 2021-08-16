using SnapstatsOrg.Shared.Models;
using SnapstatsOrg.Shared.Models.DeveloperCounts;
using SnapstatsOrg.Shared.Models.SnapCounts;

namespace SnapstatsOrg.Client.GraphQLQueries
{
    public class IndexQuery
    {
        public SnapCountByDate? snapCountsByDate { get; set; }
        public DeveloperCountByDate? developerCountsByDate { get; set; }
        public Snap[]? snapsByDate { get; set; }
        public uint? findSnapsCount { get; set; }
        public uint? verifiedDeveloperCount { get; set; }
    }
}
