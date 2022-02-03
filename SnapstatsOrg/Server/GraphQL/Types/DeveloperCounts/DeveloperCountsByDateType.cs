﻿using GraphQL.Types;
using SnapstatsOrg.Shared.Models.DeveloperCounts;

namespace SnapstatsOrg.Server.GraphQL.Types.DeveloperCounts
{
    public class DeveloperCountsByDateType : ObjectGraphType<DeveloperCountByDate>
    {
        public DeveloperCountsByDateType()
        {
            Field(f => f._id);
            Field(f => f.developerCounts);
        }
    }
}