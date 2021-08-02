using System;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using GraphQL;
using GraphQL.Types;
using SnapstatsOrg.Shared.GraphQL.Infrastructure;
using SnapstatsOrg.Shared.GraphQL.Types;
using SnapstatsOrg.Shared.Models;
using System.Linq;
using Microsoft.Azure.Documents.Linq;
using GraphQL.Execution;
using SnapstatsOrg.Shared.Models.Derived;

namespace SnapstatsOrg.Shared.GraphQL
{
    public class SnapstatsQuery : ObjectGraphType
    {
        public static readonly Uri _architecturesCollectionUri = UriFactory.CreateDocumentCollectionUri(Constants.DATABASE_NAME, Constants.ARCHITECTURES_COLLECTION_NAME);
        public static readonly Uri _basesCollectionUri = UriFactory.CreateDocumentCollectionUri(Constants.DATABASE_NAME, Constants.BASES_COLLECTION_NAME);
        public static readonly Uri _channelsCollectionUri = UriFactory.CreateDocumentCollectionUri(Constants.DATABASE_NAME, Constants.CHANNELS_COLLECTION_NAME);
        public static readonly Uri _confinementsCollectionUri = UriFactory.CreateDocumentCollectionUri(Constants.DATABASE_NAME, Constants.CONFINEMENTS_COLLECTION_NAME);
        public static readonly Uri _developerCountsCollectionUri = UriFactory.CreateDocumentCollectionUri(Constants.DATABASE_NAME, Constants.DEVELOPER_COUNTS_COLLECTION_NAME);
        public static readonly Uri _licensesCollectionUri = UriFactory.CreateDocumentCollectionUri(Constants.DATABASE_NAME, Constants.LICENSES_COLLECTION_NAME);
        public static readonly Uri _ratingsCollectionUri = UriFactory.CreateDocumentCollectionUri(Constants.DATABASE_NAME, Constants.RATINGS_COLLECTION_NAME);
        public static readonly Uri _sectionsCollectionUri = UriFactory.CreateDocumentCollectionUri(Constants.DATABASE_NAME, Constants.SECTIONS_COLLECTION_NAME);
        public static readonly Uri _snapCountsCollectionUri = UriFactory.CreateDocumentCollectionUri(Constants.DATABASE_NAME, Constants.SNAP_COUNTS_COLLECTION_NAME);
        public static readonly Uri _snapsCollectionUri = UriFactory.CreateDocumentCollectionUri(Constants.DATABASE_NAME, Constants.SNAPS_COLLECTION_NAME);

        public static readonly FeedOptions _feedOptionsOne = new FeedOptions { MaxItemCount = 1, EnableCrossPartitionQuery = true };
        public static readonly FeedOptions _feedOptionsTwenty = new FeedOptions { MaxItemCount = 20, EnableCrossPartitionQuery = true };
        public static readonly FeedOptions _feedOptionsUnlimited = new FeedOptions { MaxItemCount = -1, EnableCrossPartitionQuery = true };

        public SnapstatsQuery(IDocumentClient documentClient)
        {
            #region Architectures
            Field<ListGraphType<CountsType>>(
                "architecture",
                arguments: new QueryArguments(new QueryArgument<StringGraphType> { Name = "snap_id" }),
                resolve: context => documentClient.CreateDocumentQuery<Architecture>(_architecturesCollectionUri, context.ToSqlQuerySpec(), _feedOptionsUnlimited)
            );

            FieldAsync<IntGraphType>(
                "architectureCount",
                resolve: async context => await context.GetDocumentCount(documentClient, _architecturesCollectionUri, _feedOptionsUnlimited)
            );

            Field<ListGraphType<CountsType>>(
                "architectures",
                resolve: context => documentClient.CreateDocumentQuery<Architecture>(_architecturesCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<ListGraphType<CountsType>>(
                "architecturesByDate",
                resolve: context => documentClient.CreateDocumentQuery<Architecture>(_architecturesCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<ListGraphType<TimelineType>>(
                "architectureTimeline",
                arguments: new QueryArguments(new QueryArgument<DateGraphType> { Name = "from" }),
                resolve: context => documentClient.CreateDocumentQuery<Timeline>(_architecturesCollectionUri, context.ToTimelineOfCountsQuerySpec("architectures"), _feedOptionsUnlimited)
            );
            #endregion

            #region Bases
            Field<ListGraphType<CountsType>>(
                "base",
                arguments: new QueryArguments(new QueryArgument<StringGraphType> { Name = "_id" }),
                resolve: context => documentClient.CreateDocumentQuery<Base>(_basesCollectionUri, context.ToSqlQuerySpec(), _feedOptionsUnlimited)
            );

            FieldAsync<IntGraphType>(
                "baseCount",
                resolve: async context => await context.GetDocumentCount(documentClient, _basesCollectionUri, _feedOptionsUnlimited)
            );

            Field<ListGraphType<CountsType>>(
                "bases",
                resolve: context => documentClient.CreateDocumentQuery<Base>(_basesCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<ListGraphType<CountsType>>(
                "basesByDate",
                resolve: context => documentClient.CreateDocumentQuery<Base>(_basesCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<ListGraphType<TimelineType>>(
                "baseTimeline",
                arguments: new QueryArguments(new QueryArgument<DateGraphType> { Name = "from" }),
                resolve: context => documentClient.CreateDocumentQuery<Timeline>(_basesCollectionUri, context.ToTimelineOfCountsQuerySpec("bases"), _feedOptionsUnlimited)
            );
            #endregion

            #region Channels
            Field<ListGraphType<CountsType>>(
                "channel",
                arguments: new QueryArguments(new QueryArgument<StringGraphType> { Name = "_id" }),
                resolve: context => documentClient.CreateDocumentQuery<Channel>(_channelsCollectionUri, context.ToSqlQuerySpec(), _feedOptionsUnlimited)
            );

            FieldAsync<IntGraphType>(
                "channelCount",
                resolve: async context => await context.GetDocumentCount(documentClient, _channelsCollectionUri, _feedOptionsUnlimited)
            );

            Field<ListGraphType<CountsType>>(
                "channels",
                resolve: context => documentClient.CreateDocumentQuery<Channel>(_channelsCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<ListGraphType<CountsType>>(
                "channelsByDate",
                resolve: context => documentClient.CreateDocumentQuery<Channel>(_channelsCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<ListGraphType<TimelineType>>(
                "channelTimeline",
                arguments: new QueryArguments(new QueryArgument<DateGraphType> { Name = "from" }),
                resolve: context => documentClient.CreateDocumentQuery<Timeline>(_channelsCollectionUri, context.ToTimelineOfCountsQuerySpec("channels"), _feedOptionsUnlimited)
            );
            #endregion

            #region Confinements
            Field<ListGraphType<CountsType>>(
                "confinement",
                arguments: new QueryArguments(new QueryArgument<StringGraphType> { Name = "_id" }),
                resolve: context => documentClient.CreateDocumentQuery<Confinement>(_confinementsCollectionUri, context.ToSqlQuerySpec(), _feedOptionsUnlimited)
            );

            FieldAsync<IntGraphType>(
                "confinementCount",
                resolve: async context => await context.GetDocumentCount(documentClient, _confinementsCollectionUri, _feedOptionsUnlimited)
            );

            Field<ListGraphType<CountsType>>(
                "confinements",
                resolve: context => documentClient.CreateDocumentQuery<Confinement>(_confinementsCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<ListGraphType<CountsType>>(
                "confinementsByDate",
                resolve: context => documentClient.CreateDocumentQuery<Confinement>(_confinementsCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<ListGraphType<TimelineType>>(
                "confinementTimeline",
                arguments: new QueryArguments(new QueryArgument<DateGraphType> { Name = "from" }),
                resolve: context => documentClient.CreateDocumentQuery<Timeline>(_confinementsCollectionUri, context.ToTimelineOfCountsQuerySpec("confinements"), _feedOptionsUnlimited)
            );
            #endregion

            #region DeveloperCounts
            Field<ListGraphType<CountsType>>(
                "developerCount",
                arguments: new QueryArguments(new QueryArgument<StringGraphType> { Name = "_id" }),
                resolve: context => documentClient.CreateDocumentQuery<DeveloperCount>(_developerCountsCollectionUri, context.ToSqlQuerySpec(), _feedOptionsUnlimited)
            );

            FieldAsync<IntGraphType>(
                "developerCountCount",
                resolve: async context => await context.GetDocumentCount(documentClient, _developerCountsCollectionUri, _feedOptionsUnlimited)
            );

            Field<ListGraphType<CountsType>>(
                "developerCounts",
                resolve: context => documentClient.CreateDocumentQuery<DeveloperCount>(_developerCountsCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<ListGraphType<DeveloperCountType>>(
                "developerCountsByDate",
                resolve: context => documentClient.CreateDocumentQuery<DeveloperCount>(_developerCountsCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<TimelineType>(
                "developerCountTimeline",
                arguments: new QueryArguments(new QueryArgument<DateGraphType> { Name = "from" }),
                resolve: context => documentClient.CreateDocumentQuery<DeveloperCount>(_developerCountsCollectionUri, context.ToTimelineQuerySpec(), _feedOptionsUnlimited)
            );

            FieldAsync<ListGraphType<StringGraphType>>(
                "verifiedDevelopers",
                resolve: async context => await context.GetVerifiedDeveloperNames(documentClient, _snapsCollectionUri, _feedOptionsUnlimited)
            );

            FieldAsync<IntGraphType>(
                "verifiedDeveloperCount",
                resolve: async context => {
                    var response = await context.GetVerifiedDeveloperNames(documentClient, _snapsCollectionUri, _feedOptionsUnlimited);
                    return response.Length;
                }
            );
            #endregion

            #region Licenses
            Field<ListGraphType<CountsType>>(
                "license",
                arguments: new QueryArguments(new QueryArgument<StringGraphType> { Name = "_id" }),
                resolve: context => documentClient.CreateDocumentQuery<License>(_licensesCollectionUri, context.ToSqlQuerySpec(), _feedOptionsUnlimited)
            );

            FieldAsync<IntGraphType>(
                "licenseCount",
                resolve: async context => await context.GetDocumentCount(documentClient, _licensesCollectionUri, _feedOptionsUnlimited)
            );

            Field<ListGraphType<CountsType>>(
                "licenses",
                resolve: context => documentClient.CreateDocumentQuery<License>(_licensesCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<ListGraphType<CountsType>>(
                "licensesByDate",
                resolve: context => documentClient.CreateDocumentQuery<License>(_licensesCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<ListGraphType<TimelineType>>(
                "licenseTimeline",
                arguments: new QueryArguments(new QueryArgument<DateGraphType> { Name = "from" }),
                resolve: context => documentClient.CreateDocumentQuery<Timeline>(_licensesCollectionUri, context.ToTimelineOfCountsQuerySpec("licenses"), _feedOptionsUnlimited)
            );
            #endregion

            #region Sections
            Field<ListGraphType<CountsType>>(
                "section",
                arguments: new QueryArguments(new QueryArgument<StringGraphType> { Name = "_id" }),
                resolve: context => documentClient.CreateDocumentQuery<Section>(_sectionsCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            FieldAsync<IntGraphType>(
                "sectionCount",
                resolve: async context => await context.GetDocumentCount(documentClient, _sectionsCollectionUri, _feedOptionsUnlimited)
            );

            Field<ListGraphType<CountsType>>(
                "sections",
                resolve: context => documentClient.CreateDocumentQuery<Section>(_sectionsCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<ListGraphType<CountsType>>(
                "sectionsByDate",
                resolve: context => documentClient.CreateDocumentQuery<Section>(_sectionsCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<ListGraphType<TimelineType>>(
                "sectionTimeline",
                arguments: new QueryArguments(new QueryArgument<DateGraphType> { Name = "from" }),
                resolve: context => documentClient.CreateDocumentQuery<Timeline>(_sectionsCollectionUri, context.ToTimelineOfCountsQuerySpec("sections"), _feedOptionsUnlimited)
            );
            #endregion

            #region Snaps
            var findSnapsArgs = new QueryArguments(
                new QueryArgument<StringGraphType> { Name = "name", DefaultValue = "" },
                new QueryArgument<StringGraphType> { Name = "publisher", DefaultValue = "" },
                new QueryArgument<StringGraphType> { Name = "developer", DefaultValue = "" },
                new QueryArgument<StringGraphType> { Name = "base", DefaultValue = "" },
                new QueryArgument<StringGraphType> { Name = "architecture", DefaultValue = "" },
                new QueryArgument<StringGraphType> { Name = "category", DefaultValue = "" },
                new QueryArgument<StringGraphType> { Name = "license", DefaultValue = "" },
                new QueryArgument<ValidationEnum> { Name = "developer_validation", DefaultValue = null },
                new QueryArgument<StringGraphType> { Name = "continuationToken", DefaultValue = "" }
            );

            FieldAsync<PaginationType<Snap>>(
                "snap",
                arguments: findSnapsArgs,
                resolve: async context =>
                {
                    var query = documentClient.CreateDocumentQueryWithPagination<Snap>(
                        _snapsCollectionUri,
                        context.ToSqlOrderedQuerySpec<Snap>(o => o.name),
                        _feedOptionsTwenty,
                        context.GetArgument<string>("continuationToken")
                    );
                    return await context.AddPagination(query);
                }
            );

            FieldAsync<PaginationType<Snap>>(
                "findSnaps",
                arguments: findSnapsArgs,
                resolve: async context =>
                {
                    var query = documentClient.CreateDocumentQueryWithPagination<Snap>(
                        _snapsCollectionUri,
                        context.ToSqlOrderedQuerySpec<Snap>(o => o.name),
                        _feedOptionsTwenty,
                        context.GetArgument<string>("continuationToken")
                    );
                    return await context.AddPagination(query);
                }
            );

            FieldAsync<IntGraphType>(
                "findSnapsCount",
                arguments: findSnapsArgs,
                resolve: async context => await context.GetDocumentCount(documentClient, _snapsCollectionUri, _feedOptionsUnlimited)
            );

            FieldAsync<PaginationType<Snap>>(
                "findSnapsByName",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "name", DefaultValue = "" },
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "continuationToken", DefaultValue = "" }
                ),
                resolve: async context =>
                {
                    var query = documentClient.CreateDocumentQueryWithPagination<Snap>(
                        _snapsCollectionUri,
                        context.ToSqlOrderedQuerySpec<Snap>(o => o.name),
                        _feedOptionsTwenty,
                        context.GetArgument<string>("continuationToken")
                    );
                    return await context.AddPagination(query);
                }
            );

            FieldAsync<IntGraphType>(
                "findSnapsByNameCount",
                arguments: new QueryArguments(new QueryArgument<StringGraphType> { Name = "name", DefaultValue = "" }),
                resolve: async context => await context.GetDocumentCount(documentClient, _snapsCollectionUri, _feedOptionsUnlimited)
            );

            FieldAsync<PaginationType<Snap>>(
                "findSnapsByBase",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "base", DefaultValue = "" },
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "continuationToken", DefaultValue = "" }
                ),
                resolve: async context =>
                {
                    var query = documentClient.CreateDocumentQueryWithPagination<Snap>(
                        _snapsCollectionUri,
                        context.ToSqlOrderedQuerySpec<Snap>(o => o.name),
                        _feedOptionsTwenty,
                        context.GetArgument<string>("continuationToken")
                    );
                    return await context.AddPagination(query);
                }
            );

            FieldAsync<IntGraphType>(
                "findSnapsByBaseCount",
                arguments: new QueryArguments(new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "base", DefaultValue = "" }),
                resolve: async context => await context.GetDocumentCount(documentClient, _snapsCollectionUri, _feedOptionsUnlimited)
            );

            FieldAsync<SnapType>(
                "snapByName",
                arguments: new QueryArguments(new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "name" }),
                resolve: async context =>
                {
                    var query = documentClient.CreateDocumentQuery<Snap>(_snapsCollectionUri, context.ToSqlQuerySpec(), _feedOptionsOne);
                    var docQuery = query.AsDocumentQuery();
                    var response = await docQuery.ExecuteNextAsync<Snap>();
                    return response.FirstOrDefault();
                }
            );

            FieldAsync<SnapType>(
                "snapById",
                arguments: new QueryArguments(new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "snap_id" }),
                resolve: async context =>
                {
                    var query = documentClient.CreateDocumentQuery<Snap>(_snapsCollectionUri, context.ToSqlQuerySpec(), _feedOptionsOne);
                    var docQuery = query.AsDocumentQuery();
                    var response = await docQuery.ExecuteNextAsync<Snap>();
                    return response.FirstOrDefault();
                }
            );

            FieldAsync<PaginationType<Snap>>(
                "snapsByDate",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<IntGraphType>> { Name = "limit", DefaultValue = 20 },
                    new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "continuationToken", DefaultValue = "" }
                ),
                resolve: async context =>
                {
                    var limit = 20;
                    context.Arguments.TryGetValue("limit", out var limitArg);
                    if (limitArg.Value is not null)
                    {
                        limit = (int)limitArg.Value;
                        if (limit > 20 || limit < 0) limit = 20;
                    }
                    context.Arguments.Remove("limit");

                    var feedOptions = new FeedOptions() { MaxItemCount = limit };
                    var query = documentClient.CreateDocumentQueryWithPagination<Snap>(
                        _snapsCollectionUri,
                        context.ToSqlOrderedQuerySpec<Snap>(o => o.date_published, "DESC"),
                        feedOptions,
                        context.GetArgument<string>("continuationToken")
                    );
                    return await context.AddPagination(query);
                }
            );

            FieldAsync<IntGraphType>(
                "snapsByDateCount",
                resolve: async context => await context.GetDocumentCount(documentClient, _snapsCollectionUri, _feedOptionsUnlimited)
            );

            FieldAsync<PaginationType<Snap>>(
                "snapsByUpdatedDate",
                resolve: async context =>
                {
                    var query = documentClient.CreateDocumentQueryWithPagination<Snap>(
                        _snapsCollectionUri,
                        context.ToSqlOrderedQuerySpec<Snap>(o => o.last_updated),
                        _feedOptionsTwenty,
                        context.GetArgument<string>("continuationToken")
                    );
                    return await context.AddPagination(query);
                }
            );

            FieldAsync<IntGraphType>(
                "snapsByUpdatedDateCount",
                resolve: async context => await context.GetDocumentCount(documentClient, _snapsCollectionUri, _feedOptionsUnlimited)
            );
            #endregion

            #region SnapCounts
            Field<ListGraphType<CountsType>>(
                "snapCount",
                arguments: new QueryArguments(new QueryArgument<StringGraphType> { Name = "_id" }),
                resolve: context => documentClient.CreateDocumentQuery<SnapCount>(_snapCountsCollectionUri, context.ToSqlQuerySpec(), _feedOptionsUnlimited)
            );

            FieldAsync<IntGraphType>(
                "snapCountCount",
                resolve: async context => await context.GetDocumentCount(documentClient, _snapCountsCollectionUri, _feedOptionsUnlimited)
            );

            Field<ListGraphType<SnapCountType>>(
                "snapCounts",
                resolve: context => documentClient.CreateDocumentQuery<SnapCount>(_snapCountsCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<ListGraphType<SnapCountType>>(
                "snapCountsByDate",
                resolve: context => documentClient.CreateDocumentQuery<SnapCount>(_snapCountsCollectionUri, context.ToSqlLimitOneYearQuerySpec(), _feedOptionsUnlimited)
            );

            Field<TimelineType>(
                "snapCountTimeline",
                arguments: new QueryArguments(new QueryArgument<DateGraphType> { Name = "from" }),
                resolve: context => documentClient.CreateDocumentQuery<SnapCount>(_snapCountsCollectionUri, context.ToSnapCountTimelineQuerySpec(), _feedOptionsUnlimited)
            );
            #endregion
        }
    }
}
