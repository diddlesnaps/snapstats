using System;
using GraphQL.Utilities;
using Microsoft.Extensions.DependencyInjection;
using GraphQLSchema = GraphQL.Types.Schema;
using SnapstatsOrg.Shared.Models;
using SnapstatsOrg.Shared.Models.Architectures;
using SnapstatsOrg.Shared.Models.Bases;
using SnapstatsOrg.Shared.Models.Channels;
using SnapstatsOrg.Shared.Models.Confinements;
using SnapstatsOrg.Shared.Models.DeveloperCounts;
using SnapstatsOrg.Shared.Models.Licenses;
using SnapstatsOrg.Shared.Models.Sections;
using SnapstatsOrg.Shared.Models.SnapCounts;
using SnapstatsOrg.Shared.GraphQL.Types;
using SnapstatsOrg.Shared.GraphQL.Types.Architectures;
using SnapstatsOrg.Shared.GraphQL.Types.Bases;
using SnapstatsOrg.Shared.GraphQL.Types.Channels;
using SnapstatsOrg.Shared.GraphQL.Types.Confinements;
using SnapstatsOrg.Shared.GraphQL.Types.DeveloperCounts;
using SnapstatsOrg.Shared.GraphQL.Types.Licenses;
using SnapstatsOrg.Shared.GraphQL.Types.Sections;
using SnapstatsOrg.Shared.GraphQL.Types.SnapCounts;

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

            RegisterTypeMapping(typeof(Architecture), typeof(ArchitectureType));
            RegisterTypeMapping(typeof(Base), typeof(BaseType));
            RegisterTypeMapping(typeof(Channel), typeof(ChannelType));
            RegisterTypeMapping(typeof(Confinement), typeof(ConfinementType));
            RegisterTypeMapping(typeof(DeveloperCount), typeof(DeveloperCountType));
            RegisterTypeMapping(typeof(License), typeof(LicenseType));
            RegisterTypeMapping(typeof(Section), typeof(SectionType));
            RegisterTypeMapping(typeof(SnapCount), typeof(SnapCountType));

            RegisterTypeMapping(typeof(Count), typeof(CountType));
        }
    }
}
