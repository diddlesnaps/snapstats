﻿using SnapstatsOrg.Shared.Models;
using SnapstatsOrg.Shared.Models.Derived;

namespace SnapstatsOrg.Shared.GraphQL.Queries
{
    public class SnapsByDate
    {
        public Pagination<Snap>? snapsByDate { get; set; }
    }
}
