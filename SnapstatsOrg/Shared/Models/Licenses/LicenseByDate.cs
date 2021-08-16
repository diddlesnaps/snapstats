using System;

namespace SnapstatsOrg.Shared.Models.Licenses
{
    public class LicenseByDate
    {
        public DateTime _id { get; set; }
        public License[] licenses { get; set; } = Array.Empty<License>();
    }
}
