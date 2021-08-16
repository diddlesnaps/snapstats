using SnapstatsOrg.Shared.Models.DeveloperCounts;

namespace SnapstatsOrg.Client.GraphQLQueries
{
    public class DevelopersQuery
    {
        public DeveloperCountByDate? developerCountsByDate { get; set; }
        public int? findSnapsCount { get; set; }
        public string[]? verifiedDevelopers { get; set; }
    }
}
