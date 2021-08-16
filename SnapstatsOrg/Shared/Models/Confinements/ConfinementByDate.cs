using System;

namespace SnapstatsOrg.Shared.Models.Confinements
{
    public class ConfinementByDate
    {
        public DateTime _id { get; set; }
        public Confinement[] confinements { get; set; } = Array.Empty<Confinement>();
    }
}
