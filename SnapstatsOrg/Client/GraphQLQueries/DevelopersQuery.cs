using SnapstatsOrg.Shared.Models;

namespace SnapstatsOrg.Client.GraphQLQueries
{
    public class DevelopersQuery
    {
        public DeveloperCount[]? developerCountsByDate { get; set; }
        public uint? findSnapsCount { get; set; }
        public string[]? verifiedDevelopers { get; set; }
    }
}
