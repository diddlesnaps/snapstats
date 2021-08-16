using SnapstatsOrg.Shared.Models;
using System;

namespace SnapstatsOrg.Client.GraphQLQueries
{
    public class LicenseTimelineQuery
    {
        public Timeline[] licenseTimeline { get; set; } = Array.Empty<Timeline>();
    }
}
