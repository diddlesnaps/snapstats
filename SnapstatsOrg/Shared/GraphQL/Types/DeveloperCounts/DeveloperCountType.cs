using GraphQL.Types;
using SnapstatsOrg.Shared.Models.DeveloperCounts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SnapstatsOrg.Shared.GraphQL.Types.DeveloperCounts
{
    public class DeveloperCountType : ObjectGraphType<DeveloperCount>
    {
        public DeveloperCountType()
        {
            Field(f => f.date);
            Field(f => f.total);
            Field(f => f.mean);
            Field(f => f.median);
            Field(f => f.mode);
        }
    }
}
