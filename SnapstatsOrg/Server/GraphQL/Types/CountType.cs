﻿using GraphQL.Types;
using SnapstatsOrg.Shared.Models;

namespace SnapstatsOrg.Server.GraphQL.Types.Architectures
{
    public class CountType : ObjectGraphType<Count>
    {
        public CountType()
        {
            Field(f => f.date);
            Field(f => f.count);
        }
    }
}