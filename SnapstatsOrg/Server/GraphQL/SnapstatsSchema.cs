using System;
using GraphQLSchema = GraphQL.Types.Schema;
using SnapstatsOrg.Server.GraphQL.Types;
using SnapstatsOrg.Server.GraphQL.Types.Architectures;
using SnapstatsOrg.Server.GraphQL.Types.Bases;
using SnapstatsOrg.Server.GraphQL.Types.Channels;
using SnapstatsOrg.Server.GraphQL.Types.Confinements;
using SnapstatsOrg.Server.GraphQL.Types.DeveloperCounts;
using SnapstatsOrg.Server.GraphQL.Types.Licenses;
using SnapstatsOrg.Server.GraphQL.Types.Sections;
using SnapstatsOrg.Server.GraphQL.Types.SnapCounts;
using SnapstatsOrg.Shared.Models;
using SnapstatsOrg.Shared.Models.Architectures;
using SnapstatsOrg.Shared.Models.Bases;
using SnapstatsOrg.Shared.Models.Channels;
using SnapstatsOrg.Shared.Models.Confinements;
using SnapstatsOrg.Shared.Models.DeveloperCounts;
using SnapstatsOrg.Shared.Models.Licenses;
using SnapstatsOrg.Shared.Models.Sections;
using SnapstatsOrg.Shared.Models.SnapCounts;
using Microsoft.Extensions.DependencyInjection;

namespace SnapstatsOrg.Server.GraphQL
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
