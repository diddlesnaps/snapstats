using System;
using GraphQL.Utilities;
using SnapstatsOrg.Shared.GraphQL.Types;
using Microsoft.Extensions.DependencyInjection;
using GraphQLSchema = GraphQL.Types.Schema;
using SnapstatsOrg.Shared.Models;
using SnapstatsOrg.Shared.Models.Derived;
using SnapstatsOrg.Shared.Models.Interfaces;

namespace SnapstatsOrg.Shared.GraphQL
{
    public class SnapstatsSchema : GraphQLSchema
    {
        public SnapstatsSchema(IServiceProvider serviceProvider)
            : base(serviceProvider)
        {
            Query = serviceProvider.GetRequiredService<SnapstatsQuery>();

            #region Snaps
            RegisterTypeMapping(typeof(Snap), typeof(SnapType));
            RegisterTypeMapping(typeof(SnapAlias), typeof(SnapAliasType));
            RegisterTypeMapping(typeof(SnapMedia), typeof(SnapMediaType));
            RegisterTypeMapping(typeof(Plug), typeof(PlugType));
            RegisterTypeMapping(typeof(Slot), typeof(SlotType));
            RegisterTypeMapping(typeof(SnapConfinement), typeof(SnapConfinementEnum));
            RegisterTypeMapping(typeof(Validation), typeof(ValidationEnum));
            #endregion

            RegisterTypeMapping(typeof(ICounts), typeof(CountsType));
            RegisterTypeMapping(typeof(Timeline), typeof(TimelineType));
            RegisterTypeMapping(typeof(TimelineCounts), typeof(TimelineCountsType));

            RegisterTypeMapping(typeof(SnapCount), typeof(SnapCountType));

            RegisterTypeMapping(typeof(DeveloperCount), typeof(DeveloperCountType));
        }
    }
}
