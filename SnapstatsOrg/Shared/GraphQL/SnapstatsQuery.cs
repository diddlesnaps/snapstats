using GraphQL;
using GraphQL.Types;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using SnapstatsOrg.Shared.GraphQL;
using SnapstatsOrg.Shared.GraphQL.Infrastructure;
using SnapstatsOrg.Shared.GraphQL.Types;
using SnapstatsOrg.Shared.GraphQL.Types.Architectures;
using SnapstatsOrg.Shared.GraphQL.Types.Bases;
using SnapstatsOrg.Shared.GraphQL.Types.Channels;
using SnapstatsOrg.Shared.GraphQL.Types.Confinements;
using SnapstatsOrg.Shared.GraphQL.Types.DeveloperCounts;
using SnapstatsOrg.Shared.GraphQL.Types.Licenses;
using SnapstatsOrg.Shared.GraphQL.Types.Sections;
using SnapstatsOrg.Shared.GraphQL.Types.SnapCounts;
using SnapstatsOrg.Shared.Models;
using SnapstatsOrg.Shared.Models.Architectures;
using SnapstatsOrg.Shared.Models.Bases;
using SnapstatsOrg.Shared.Models.Channels;
using SnapstatsOrg.Shared.Models.Confinements;
using SnapstatsOrg.Shared.Models.DeveloperCounts;
using SnapstatsOrg.Shared.Models.Licenses;
using SnapstatsOrg.Shared.Models.Sections;
using SnapstatsOrg.Shared.Models.SnapCounts;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SnapstatsOrg.Shared.GraphQL
{
    public class SnapstatsQuery : ObjectGraphType
    {
        public SnapstatsQuery(IMongoDatabase db)
        {
            #region Architectures
            Field<ListGraphType<CountType>>(
                "architecture",
                arguments: new QueryArguments(new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "_id" }),
                resolve: context => {
                    var name = context.GetArgument<string>("_id");
                    return db.GetCollection<Architecture>(Constants.ARCHITECTURES_COLLECTION_NAME).Find(new FilterDefinitionBuilder<Architecture>().Where(f => f.name == name));
                }
            );

            Field<IntGraphType>(
                "architectureCount",
                resolve: context => db.GetCollection<Architecture>(Constants.ARCHITECTURES_COLLECTION_NAME).CountDocuments(FilterDefinition<Architecture>.Empty)
            );

            Field<ListGraphType<CountType>>(
                "architectures",
                arguments: new QueryArguments(new QueryArgument<DecimalGraphType> { Name = "offset" }, new QueryArgument<DecimalGraphType> { Name = "limit" }),
                resolve: context => db.GetCollection<Architecture>(Constants.ARCHITECTURES_COLLECTION_NAME)
                    .Find(FilterDefinition<Architecture>.Empty)
                    .SortByDescending(s => s.date)
                    .Skip(context.GetArgument<int?>("offset", 0))
                    .Limit(context.GetArgument<int?>("limit", 20))
                    .ToEnumerable()
            );

            Field<ArchitecturesByDateType>(
                "architecturesByDate",
                resolve: context => {
                    var updated = db.GetCollection<LastUpdated>(Constants.LAST_UPDATEDS_COLLECTION_NAME).Find(FilterDefinition<LastUpdated>.Empty).First();
                    var date = updated.date;
                    var architectures = db.GetCollection<Architecture>(Constants.ARCHITECTURES_COLLECTION_NAME).Find(f => f.date == date);
                    return new ArchitectureByDate() { _id = date, architectures = architectures.ToEnumerable().ToArray() };
                }
            );

            Field<ListGraphType<TimelineType>>(
                "architectureTimeline",
                arguments: new QueryArguments(new QueryArgument<DateTimeGraphType> { Name = "from" }),
                resolve: context => {
                    var now = DateTime.Now;
                    var lastYear = now.AddYears(-1);
                    var from = context.GetArgument<DateTime>("from");
                    if (from < lastYear)
                    {
                        from = lastYear;
                    }

                    var cal = CultureInfo.InvariantCulture.Calendar;
                    var startWeek = cal.GetWeekOfYear(from, CalendarWeekRule.FirstFullWeek, DayOfWeek.Monday);

                    return db.GetCollection<Architecture>(Constants.ARCHITECTURES_COLLECTION_NAME).Aggregate()
                        .Match(m => m.date >= from)
                        .Group(
                            g => new
                            {
                                year = g.date.Year,
                                month = g.date.Month,
                                day = g.date.Day,
                                name = g.name,
                            },
                            g => new
                            {
                                _id = g.Key,
                                count = g.Max(m => m.count),
                            })
                        .Project(
                            p => new
                            {
                                _id = new DateTime(p._id.year, p._id.month, p._id.day),
                                p.count,
                                p._id.name,
                            })
                        .SortByDescending(p => p._id)
                        .Group<Timeline>(new BsonDocument
                        {
                            { "_id", "$name" },
                            {
                                "counts", new BsonDocument
                                {
                                    {
                                        "$push", new BsonDocument
                                        {
                                            { "count", "$count" },
                                            { "date", "$_id" }
                                        }
                                    }
                                }
                            }
                        })
                        .ToEnumerable();
                }
            );
            #endregion

            #region Bases
            Field<ListGraphType<CountType>>(
                "base",
                arguments: new QueryArguments(new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "_id" }),
                resolve: context => {
                    var name = context.GetArgument<string>("_id");
                    return db.GetCollection<Base>(Constants.BASES_COLLECTION_NAME).Find(new FilterDefinitionBuilder<Base>().Where(f => f.name == name));
                }
            );

            Field<IntGraphType>(
                "baseCount",
                resolve: context => db.GetCollection<Base>(Constants.BASES_COLLECTION_NAME).CountDocuments(FilterDefinition<Base>.Empty)
            );

            Field<ListGraphType<CountType>>(
                "bases",
                arguments: new QueryArguments(new QueryArgument<DecimalGraphType> { Name = "offset" }, new QueryArgument<DecimalGraphType> { Name = "limit" }),
                resolve: context => db.GetCollection<Base>(Constants.BASES_COLLECTION_NAME)
                    .Find(FilterDefinition<Base>.Empty)
                    .SortByDescending(s => s.date)
                    .Skip(context.GetArgument<int?>("offset", 0))
                    .Limit(context.GetArgument<int?>("limit", 20))
                    .ToEnumerable()
            );

            Field<BasesByDateType>(
                "basesByDate",
                resolve: context => {
                    var updated = db.GetCollection<LastUpdated>(Constants.LAST_UPDATEDS_COLLECTION_NAME).Find(FilterDefinition<LastUpdated>.Empty).First();
                    var date = updated.date;
                    var bases = db.GetCollection<Base>(Constants.BASES_COLLECTION_NAME).Find(f => f.date == date);
                    return new BaseByDate() { _id = date, bases = bases.ToEnumerable().ToArray() };
                }
            );

            Field<ListGraphType<TimelineType>>(
                "baseTimeline",
                arguments: new QueryArguments(new QueryArgument<DateTimeGraphType> { Name = "from" }),
                resolve: context => {
                    var now = DateTime.Now;
                    var lastYear = now.AddYears(-1);
                    var from = context.GetArgument<DateTime>("from");
                    if (from < lastYear)
                    {
                        from = lastYear;
                    }

                    var cal = CultureInfo.InvariantCulture.Calendar;
                    var startWeek = cal.GetWeekOfYear(from, CalendarWeekRule.FirstFullWeek, DayOfWeek.Monday);

                    return db.GetCollection<Base>(Constants.BASES_COLLECTION_NAME).Aggregate()
                        .Match(m => m.date >= from)
                        .Group(
                            g => new
                            {
                                year = g.date.Year,
                                month = g.date.Month,
                                day = g.date.Day,
                                name = g.name,
                            },
                            g => new
                            {
                                _id = g.Key,
                                count = g.Max(m => m.count),
                            })
                        .Project(
                            p => new
                            {
                                _id = new DateTime(p._id.year, p._id.month, p._id.day),
                                p.count,
                                p._id.name,
                            })
                        .SortByDescending(p => p._id)
                        .Group<Timeline>(new BsonDocument
                        {
                            { "_id", "$name" },
                            {
                                "counts", new BsonDocument
                                {
                                    {
                                        "$push", new BsonDocument
                                        {
                                            { "count", "$count" },
                                            { "date", "$_id" }
                                        }
                                    }
                                }
                            }
                        })
                        .ToEnumerable();
                }
            );
            #endregion

            #region Channels
            Field<ListGraphType<CountType>>(
                "channel",
                arguments: new QueryArguments(new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "_id" }),
                resolve: context => {
                    var name = context.GetArgument<string>("_id");
                    return db.GetCollection<Channel>(Constants.CHANNELS_COLLECTION_NAME).Find(new FilterDefinitionBuilder<Channel>().Where(f => f.name == name));
                }
            );

            Field<IntGraphType>(
                "channelCount",
                resolve: context => db.GetCollection<Channel>(Constants.CHANNELS_COLLECTION_NAME).CountDocuments(FilterDefinition<Channel>.Empty)
            );

            Field<ListGraphType<CountType>>(
                "channels",
                arguments: new QueryArguments(new QueryArgument<DecimalGraphType> { Name = "offset" }, new QueryArgument<DecimalGraphType> { Name = "limit" }),
                resolve: context => db.GetCollection<Channel>(Constants.CHANNELS_COLLECTION_NAME)
                    .Find(FilterDefinition<Channel>.Empty)
                    .SortByDescending(s => s.date)
                    .Skip(context.GetArgument<int?>("offset", 0))
                    .Limit(context.GetArgument<int?>("limit", 20))
                    .ToEnumerable()
            );

            Field<ChannelsByDateType>(
                "channelsByDate",
                resolve: context => {
                    var updated = db.GetCollection<LastUpdated>(Constants.LAST_UPDATEDS_COLLECTION_NAME).Find(FilterDefinition<LastUpdated>.Empty).First();
                    var date = updated.date;
                    var channels = db.GetCollection<Channel>(Constants.CHANNELS_COLLECTION_NAME).Find(f => f.date == date);
                    return new ChannelByDate() { _id = date, channels = channels.ToEnumerable().ToArray() };
                }
            );

            Field<ListGraphType<TimelineType>>(
                "channelTimeline",
                arguments: new QueryArguments(new QueryArgument<DateTimeGraphType> { Name = "from" }),
                resolve: context => {
                    var now = DateTime.Now;
                    var lastYear = now.AddYears(-1);
                    var from = context.GetArgument<DateTime>("from");
                    if (from < lastYear)
                    {
                        from = lastYear;
                    }

                    var cal = CultureInfo.InvariantCulture.Calendar;
                    var startWeek = cal.GetWeekOfYear(from, CalendarWeekRule.FirstFullWeek, DayOfWeek.Monday);

                    return db.GetCollection<Channel>(Constants.CHANNELS_COLLECTION_NAME).Aggregate()
                        .Match(m => m.date >= from)
                        .Group(
                            g => new
                            {
                                year = g.date.Year,
                                month = g.date.Month,
                                day = g.date.Day,
                                name = g.name,
                            },
                            g => new
                            {
                                _id = g.Key,
                                count = g.Max(m => m.count),
                            })
                        .Project(
                            p => new
                            {
                                _id = new DateTime(p._id.year, p._id.month, p._id.day),
                                p.count,
                                p._id.name,
                            })
                        .SortByDescending(p => p._id)
                        .Group<Timeline>(new BsonDocument
                        {
                            { "_id", "$name" },
                            {
                                "counts", new BsonDocument
                                {
                                    {
                                        "$push", new BsonDocument
                                        {
                                            { "count", "$count" },
                                            { "date", "$_id" }
                                        }
                                    }
                                }
                            }
                        })
                        .ToEnumerable();
                }
            );
            #endregion

            #region Confinements
            Field<ListGraphType<CountType>>(
                "confinement",
                arguments: new QueryArguments(new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "_id" }),
                resolve: context => {
                    var name = context.GetArgument<string>("_id");
                    return db.GetCollection<Confinement>(Constants.CONFINEMENTS_COLLECTION_NAME).Find(new FilterDefinitionBuilder<Confinement>().Where(f => f.name == name));
                }
            );

            Field<IntGraphType>(
                "confinementCount",
                resolve: context => db.GetCollection<Confinement>(Constants.CONFINEMENTS_COLLECTION_NAME).CountDocuments(FilterDefinition<Confinement>.Empty)
            );

            Field<ListGraphType<CountType>>(
                "confinements",
                arguments: new QueryArguments(new QueryArgument<DecimalGraphType> { Name = "offset" }, new QueryArgument<DecimalGraphType> { Name = "limit" }),
                resolve: context => db.GetCollection<Confinement>(Constants.CONFINEMENTS_COLLECTION_NAME)
                    .Find(FilterDefinition<Confinement>.Empty)
                    .SortByDescending(s => s.date)
                    .Skip(context.GetArgument<int?>("offset", 0))
                    .Limit(context.GetArgument<int?>("limit", 20))
                    .ToEnumerable()
            );

            Field<ConfinementsByDateType>(
                "confinementsByDate",
                resolve: context => {
                    var updated = db.GetCollection<LastUpdated>(Constants.LAST_UPDATEDS_COLLECTION_NAME).Find(FilterDefinition<LastUpdated>.Empty).First();
                    var date = updated.date;
                    var confinements = db.GetCollection<Confinement>(Constants.CONFINEMENTS_COLLECTION_NAME).Find(f => f.date == date);
                    return new ConfinementByDate() { _id = date, confinements = confinements.ToEnumerable().ToArray() };
                }
            );

            Field<ListGraphType<TimelineType>>(
                "confinementTimeline",
                arguments: new QueryArguments(new QueryArgument<DateTimeGraphType> { Name = "from" }),
                resolve: context => {
                    var now = DateTime.Now;
                    var lastYear = now.AddYears(-1);
                    var from = context.GetArgument<DateTime>("from");
                    if (from < lastYear)
                    {
                        from = lastYear;
                    }

                    var cal = CultureInfo.InvariantCulture.Calendar;
                    var startWeek = cal.GetWeekOfYear(from, CalendarWeekRule.FirstFullWeek, DayOfWeek.Monday);

                    return db.GetCollection<Confinement>(Constants.CONFINEMENTS_COLLECTION_NAME).Aggregate()
                        .Match(m => m.date >= from)
                        .Group(
                            g => new
                            {
                                year = g.date.Year,
                                month = g.date.Month,
                                day = g.date.Day,
                                name = g.name,
                            },
                            g => new
                            {
                                _id = g.Key,
                                count = g.Max(m => m.count),
                            })
                        .Project(
                            p => new
                            {
                                _id = new DateTime(p._id.year, p._id.month, p._id.day),
                                p.count,
                                p._id.name,
                            })
                        .SortByDescending(p => p._id)
                        .Group<Timeline>(new BsonDocument
                        {
                            { "_id", "$name" },
                            {
                                "counts", new BsonDocument
                                {
                                    {
                                        "$push", new BsonDocument
                                        {
                                            { "count", "$count" },
                                            { "date", "$_id" }
                                        }
                                    }
                                }
                            }
                        })
                        .ToEnumerable();
                }
            );
            #endregion

            #region Developers
            Field<IntGraphType>(
                "developerCountCount",
                resolve: context => db.GetCollection<DeveloperCount>(Constants.DEVELOPER_COUNTS_COLLECTION_NAME).CountDocuments(FilterDefinition<DeveloperCount>.Empty)
            );

            Field<ListGraphType<CountType>>(
                "developerCounts",
                arguments: new QueryArguments(new QueryArgument<DecimalGraphType> { Name = "offset" }, new QueryArgument<DecimalGraphType> { Name = "limit" }),
                resolve: context => db.GetCollection<DeveloperCount>(Constants.DEVELOPER_COUNTS_COLLECTION_NAME)
                    .Find(FilterDefinition<DeveloperCount>.Empty)
                    .SortByDescending(s => s.date)
                    .Skip(context.GetArgument<int?>("offset", 0))
                    .Limit(context.GetArgument<int?>("limit", 20))
                    .ToEnumerable()
            );

            Field<DeveloperCountsByDateType>(
                "developerCountsByDate",
                resolve: context => {
                    var updated = db.GetCollection<LastUpdated>(Constants.LAST_UPDATEDS_COLLECTION_NAME).Find(FilterDefinition<LastUpdated>.Empty).First();
                    var date = updated.date;
                    var developerCounts = db.GetCollection<DeveloperCount>(Constants.DEVELOPER_COUNTS_COLLECTION_NAME).Find(f => f.date == date);
                    return new DeveloperCountByDate() { _id = date, developerCounts = developerCounts.ToEnumerable().ToArray() };
                }
            );

            Field<ListGraphType<TimelineType>>(
                "developerCountTimeline",
                arguments: new QueryArguments(new QueryArgument<DateTimeGraphType> { Name = "from" }),
                resolve: context => {
                    var now = DateTime.Now;
                    var lastYear = now.AddYears(-1);
                    var from = context.GetArgument<DateTime>("from");
                    if (from < lastYear)
                    {
                        from = lastYear;
                    }

                    var cal = CultureInfo.InvariantCulture.Calendar;
                    var startWeek = cal.GetWeekOfYear(from, CalendarWeekRule.FirstFullWeek, DayOfWeek.Monday);

                    return db.GetCollection<DeveloperCount>(Constants.DEVELOPER_COUNTS_COLLECTION_NAME).Aggregate()
                        .Match(m => m.date >= from)
                        .SortBy(s => s.date)
                        .Group(
                            g => new
                            {
                                year = g.date.Year,
                                month = g.date.Month,
                                day = g.date.Day,
                            },
                            g => new
                            {
                                _id = g.Key,
                                total = g.Max(m => m.total),
                                mean = g.Average(m => m.mean),
                            })
                        .Project(
                            p => new
                            {
                                _id = new DateTime(p._id.year, p._id.month, p._id.day),
                                p.total,
                                p.mean,
                            })
                        .ToEnumerable();
                }
            );

            Field<ListGraphType<StringGraphType>>(
                "verifiedDevelopers",
                resolve: context => db.GetCollection<Snap>(Constants.SNAPS_COLLECTION_NAME).Aggregate()
                    .Match(m => m.developer_validation == "verified")
                    .Group(
                        g => g.developer_name,
                        g => new
                        {
                            _id = g.Key ?? "",
                        }
                    )
                    .SortBy(s => s._id)
                    .ToEnumerable()
                    .Select(s => s._id)
            );

            Field<IntGraphType>(
                "verifiedDeveloperCount",
                resolve: context =>
                {
                    var r = db.GetCollection<Snap>(Constants.SNAPS_COLLECTION_NAME).Aggregate()
                    .Match(m => m.developer_validation == "verified")
                    .Group(
                        g => g.developer_name,
                        g => new
                        {
                            _id = g.Key
                        }
                    )
                    .Count()
                    .FirstOrDefault();
                    return r?.Count ?? 0;
                }
            );
            #endregion

            #region Licenses
            Field<ListGraphType<CountType>>(
                "license",
                arguments: new QueryArguments(new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "_id" }),
                resolve: context => {
                    var name = context.GetArgument<string>("_id");
                    return db.GetCollection<License>(Constants.LICENSES_COLLECTION_NAME).Find(new FilterDefinitionBuilder<License>().Where(f => f.name == name));
                }
            );

            Field<IntGraphType>(
                "licenseCount",
                resolve: context => db.GetCollection<License>(Constants.LICENSES_COLLECTION_NAME).CountDocuments(FilterDefinition<License>.Empty)
            );

            Field<ListGraphType<CountType>>(
                "licenses",
                arguments: new QueryArguments(new QueryArgument<DecimalGraphType> { Name = "offset" }, new QueryArgument<DecimalGraphType> { Name = "limit" }),
                resolve: context => db.GetCollection<License>(Constants.LICENSES_COLLECTION_NAME)
                    .Find(FilterDefinition<License>.Empty)
                    .SortByDescending(s => s.date)
                    .Skip(context.GetArgument<int?>("offset", 0))
                    .Limit(context.GetArgument<int?>("limit", 20))
                    .ToEnumerable()
            );

            Field<LicensesByDateType>(
                "licensesByDate",
                resolve: context => {
                    var updated = db.GetCollection<LastUpdated>(Constants.LAST_UPDATEDS_COLLECTION_NAME).Find(FilterDefinition<LastUpdated>.Empty).First();
                    var date = updated.date;
                    var licenses = db.GetCollection<License>(Constants.LICENSES_COLLECTION_NAME).Find(f => f.date == date);
                    return new LicenseByDate() { _id = date, licenses = licenses.ToEnumerable().ToArray() };
                }
            );

            Field<ListGraphType<TimelineType>>(
                "licenseTimeline",
                arguments: new QueryArguments(new QueryArgument<DateTimeGraphType> { Name = "from" }),
                resolve: context => {
                    var now = DateTime.Now;
                    var lastYear = now.AddYears(-1);
                    var from = context.GetArgument<DateTime>("from");
                    if (from < lastYear)
                    {
                        from = lastYear;
                    }

                    return db.GetCollection<License>(Constants.LICENSES_COLLECTION_NAME).Aggregate()
                        .Match(m => m.date >= from)
                        .Group(
                            g => new
                            {
                                year = g.date.Year,
                                month = g.date.Month,
                                day = g.date.Day,
                                name = g.name,
                            },
                            g => new
                            {
                                _id = g.Key,
                                count = g.Max(m => m.count),
                            })
                        .Project(
                            p => new
                            {
                                _id = new DateTime(p._id.year, p._id.month, p._id.day),
                                p.count,
                                p._id.name,
                            })
                        .SortByDescending(p => p._id)
                        .Group<Timeline>(new BsonDocument
                        {
                            { "_id", "$name" },
                            {
                                "counts", new BsonDocument
                                {
                                    {
                                        "$push", new BsonDocument
                                        {
                                            { "count", "$count" },
                                            { "date", "$_id" }
                                        }
                                    }
                                }
                            }
                        })
                        .ToEnumerable();
                }
            );
            #endregion

            #region Sections
            Field<ListGraphType<CountType>>(
                "section",
                arguments: new QueryArguments(new QueryArgument<NonNullGraphType<StringGraphType>> { Name = "_id" }),
                resolve: context => {
                    var name = context.GetArgument<string>("_id");
                    return db.GetCollection<Section>(Constants.SECTIONS_COLLECTION_NAME).Find(new FilterDefinitionBuilder<Section>().Where(f => f.name == name));
                }
            );

            Field<IntGraphType>(
                "sectionCount",
                resolve: context => db.GetCollection<Section>(Constants.SECTIONS_COLLECTION_NAME).CountDocuments(FilterDefinition<Section>.Empty)
            );

            Field<ListGraphType<CountType>>(
                "sections",
                arguments: new QueryArguments(new QueryArgument<DecimalGraphType> { Name = "offset" }, new QueryArgument<DecimalGraphType> { Name = "limit" }),
                resolve: context => db.GetCollection<Section>(Constants.SECTIONS_COLLECTION_NAME)
                    .Find(FilterDefinition<Section>.Empty)
                    .SortByDescending(s => s.date)
                    .Skip(context.GetArgument<int?>("offset", 0))
                    .Limit(context.GetArgument<int?>("limit", 20))
                    .ToEnumerable()
            );

            Field<SectionsByDateType>(
                "sectionsByDate",
                resolve: context => {
                    var updated = db.GetCollection<LastUpdated>(Constants.LAST_UPDATEDS_COLLECTION_NAME).Find(FilterDefinition<LastUpdated>.Empty).First();
                    var date = updated.date;
                    var sections = db.GetCollection<Section>(Constants.SECTIONS_COLLECTION_NAME).Find(f => f.date == date);
                    return new SectionByDate() { _id = date, sections = sections.ToEnumerable().ToArray() };
                }
            );

            Field<ListGraphType<TimelineType>>(
                "sectionTimeline",
                arguments: new QueryArguments(new QueryArgument<DateTimeGraphType> { Name = "from" }),
                resolve: context => {
                    var now = DateTime.Now;
                    var lastYear = now.AddYears(-1);
                    var from = context.GetArgument<DateTime>("from");
                    if (from < lastYear)
                    {
                        from = lastYear;
                    }

                    var cal = CultureInfo.InvariantCulture.Calendar;
                    var startWeek = cal.GetWeekOfYear(from, CalendarWeekRule.FirstFullWeek, DayOfWeek.Monday);

                    return db.GetCollection<Section>(Constants.SECTIONS_COLLECTION_NAME).Aggregate()
                        .Match(m => m.date >= from)
                        .Group(
                            g => new
                            {
                                year = g.date.Year,
                                month = g.date.Month,
                                day = g.date.Day,
                                name = g.name,
                            },
                            g => new
                            {
                                _id = g.Key,
                                count = g.Max(m => m.count),
                            })
                        .Project(
                            p => new
                            {
                                _id = new DateTime(p._id.year, p._id.month, p._id.day),
                                p.count,
                                p._id.name,
                            })
                        .SortByDescending(p => p._id)
                        .Group<Timeline>(new BsonDocument
                        {
                            { "_id", "$name" },
                            {
                                "counts", new BsonDocument
                                {
                                    {
                                        "$push", new BsonDocument
                                        {
                                            { "count", "$count" },
                                            { "date", "$_id" }
                                        }
                                    }
                                }
                            }
                        })
                        .ToEnumerable();
                }
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
                new QueryArgument<IntGraphType> { Name = "offset", DefaultValue = 0 },
                new QueryArgument<IntGraphType> { Name = "limit", DefaultValue = 20 }
            );

            var noHelloWorldOrTestRE = new MongoDB.Bson.BsonRegularExpression("(^(test|hello)-|-(test|hello)$)", "i");

            Field<ListGraphType<SnapType>>(
                "findSnaps",
                arguments: findSnapsArgs,
                resolve: context => {
                    var offset = context.GetArgument<int>("offset");
                    if (offset < 0)
                    {
                        offset = 0;
                    }

                    var limit = context.GetArgument<int>("limit");
                    if (limit > 20 || limit < 1)
                    {
                        limit = 20;
                    }

                    return context.FindSnaps(db)
                        .SortByDescending(s => s.date_published)
                        .Skip(offset)
                        .Limit(limit)
                        .ToEnumerable();
                }
            );

            Field<ListGraphType<SnapType>>(
                "findSnapsByName",
                arguments: new QueryArguments(
                    new QueryArgument<StringGraphType> { Name = "name", DefaultValue = "" },
                    new QueryArgument<IntGraphType> { Name = "offset", DefaultValue = 0 },
                    new QueryArgument<IntGraphType> { Name = "limit", DefaultValue = 20 }
                ),
                resolve: context => {
                    var offset = context.GetArgument<int>("offset");
                    if (offset < 0)
                    {
                        offset = 0;
                    }

                    var limit = context.GetArgument<int>("limit");
                    if (limit > 20 || limit < 1)
                    {
                        limit = 20;
                    }

                    return context.FindSnaps(db)
                        .SortByDescending(s => s.date_published)
                        .Skip(offset)
                        .Limit(limit)
                        .ToEnumerable();
                }
            );

            Field<ListGraphType<SnapType>>(
                "findSnapsByBase",
                arguments: new QueryArguments(
                    new QueryArgument<StringGraphType> { Name = "base", DefaultValue = "" },
                    new QueryArgument<IntGraphType> { Name = "offset", DefaultValue = 0 },
                    new QueryArgument<IntGraphType> { Name = "limit", DefaultValue = 20 }
                ),
                resolve: context => {
                    var offset = context.GetArgument<int>("offset");
                    if (offset < 0)
                    {
                        offset = 0;
                    }

                    var limit = context.GetArgument<int>("limit");
                    if (limit > 20 || limit < 1)
                    {
                        limit = 20;
                    }

                    return context.FindSnaps(db)
                        .SortByDescending(s => s.date_published)
                        .Skip(offset)
                        .Limit(limit)
                        .ToEnumerable();
                }
            );

            Field<IntGraphType>(
                "findSnapsCount",
                arguments: findSnapsArgs,
                resolve: context => context.FindSnaps(db).CountDocuments()
            );

            Field<IntGraphType>(
                "findSnapsByNameCount",
                arguments: new QueryArguments(new QueryArgument<StringGraphType> { Name = "name", DefaultValue = "" }),
                resolve: context => context.FindSnaps(db).CountDocuments()
            );

            Field<IntGraphType>(
                "findSnapsByBaseCount",
                arguments: new QueryArguments(new QueryArgument<StringGraphType> { Name = "base", DefaultValue = "" }),
                resolve: context => context.FindSnaps(db).CountDocuments()
            );

            Field<SnapType>(
                "snapById",
                arguments: new QueryArguments(new QueryArgument<StringGraphType> { Name = "snap_id", DefaultValue = "" }),
                resolve: context => db.GetCollection<Snap>(Constants.SNAPS_COLLECTION_NAME)
                    .Find(Builders<Snap>.Filter.Eq(e => e.snap_id, context.GetArgument<string>("snap_id")))
                    .Limit(1)
                    .FirstOrDefault()
            );

            Field<SnapType>(
                "snapByName",
                arguments: new QueryArguments(new QueryArgument<StringGraphType> { Name = "name", DefaultValue = "" }),
                resolve: context => db.GetCollection<Snap>(Constants.SNAPS_COLLECTION_NAME)
                    .Find(Builders<Snap>.Filter.Eq(e => e.package_name, context.GetArgument<string>("name")))
                    .Limit(1)
                    .FirstOrDefault()
            );

            Field<ListGraphType<SnapType>>(
                "snapsByDate",
                arguments: new QueryArguments(
                    new QueryArgument<IntGraphType> { Name = "offset", DefaultValue = 0 },
                    new QueryArgument<IntGraphType> { Name = "limit", DefaultValue = 20 }
                ),
                resolve: context => db.GetCollection<Snap>(Constants.SNAPS_COLLECTION_NAME)
                    .Find(FilterDefinition<Snap>.Empty)
                    .SortByDescending(s => s.date_published)
                    .Skip(context.GetArgument("offset", 0))
                    .Limit(context.GetArgument("limit", 20))
                    .ToEnumerable()
            );

            Field<IntGraphType>(
                "snapsByDateCount",
                resolve: context => db.GetCollection<Snap>(Constants.SNAPS_COLLECTION_NAME)
                    .Find(Builders<Snap>.Filter.Regex(r => r.name, noHelloWorldOrTestRE))
                    .CountDocuments()
            );

            Field<ListGraphType<SnapType>>(
                "snapsByUpdatedDate",
                arguments: new QueryArguments(
                    new QueryArgument<IntGraphType> { Name = "offset", DefaultValue = 0 },
                    new QueryArgument<IntGraphType> { Name = "limit", DefaultValue = 20 }
                ),
                resolve: context => db.GetCollection<Snap>(Constants.SNAPS_COLLECTION_NAME)
                    .Find(Builders<Snap>.Filter.Regex(r => r.name, noHelloWorldOrTestRE))
                    .SortByDescending(s => s.last_updated)
                    .Skip(context.GetArgument("offset", 0))
                    .Limit(context.GetArgument("limit", 20))
                    .ToEnumerable()
            );

            Field<IntGraphType>(
                "snapsByUpdatedDateCount",
                resolve: context => db.GetCollection<Snap>(Constants.SNAPS_COLLECTION_NAME)
                    .Find(Builders<Snap>.Filter.Regex(r => r.name, noHelloWorldOrTestRE))
                    .CountDocuments()
            );
            #endregion

            #region SnapCounts
            Field<IntGraphType>(
                "snapCountCount",
                resolve: context => db.GetCollection<SnapCount>(Constants.SNAP_COUNTS_COLLECTION_NAME).CountDocuments(FilterDefinition<SnapCount>.Empty)
            );

            Field<ListGraphType<SnapCountType>>(
                "snapCounts",
                arguments: new QueryArguments(new QueryArgument<DecimalGraphType> { Name = "offset" }, new QueryArgument<DecimalGraphType> { Name = "limit" }),
                resolve: context => db.GetCollection<SnapCount>(Constants.SNAP_COUNTS_COLLECTION_NAME)
                    .Find(FilterDefinition<SnapCount>.Empty)
                    .SortByDescending(s => s.date)
                    .Skip(context.GetArgument<int?>("offset", 0))
                    .Limit(context.GetArgument<int?>("limit", 20))
                    .ToEnumerable()
            );

            Field<SnapCountsByDateType>(
                "snapCountsByDate",
                resolve: context => {
                    var updated = db.GetCollection<LastUpdated>(Constants.LAST_UPDATEDS_COLLECTION_NAME).Find(FilterDefinition<LastUpdated>.Empty).First();
                    var date = updated.date;
                    var snapCounts = db.GetCollection<SnapCount>(Constants.SNAP_COUNTS_COLLECTION_NAME).Find(f => f.date == date);
                    return new SnapCountByDate() { _id = date, snapCounts = snapCounts.ToEnumerable().ToArray() };
                }
            );

            Field<ListGraphType<TimelineType>>(
                "snapCountTimeline",
                arguments: new QueryArguments(new QueryArgument<DateTimeGraphType> { Name = "from" }),
                resolve: context => {
                    var now = DateTime.Now;
                    var lastYear = now.AddYears(-1);
                    var from = context.GetArgument<DateTime>("from");
                    if (from < lastYear)
                    {
                        from = lastYear;
                    }

                    var cal = CultureInfo.InvariantCulture.Calendar;
                    var startWeek = cal.GetWeekOfYear(from, CalendarWeekRule.FirstFullWeek, DayOfWeek.Monday);

                    return db.GetCollection<SnapCount>(Constants.SNAP_COUNTS_COLLECTION_NAME).Aggregate()
                        .Match(m => m.date >= from)
                        .SortBy(s => s.date)
                        .Group(
                            g => new
                            {
                                year = g.date.Year,
                                month = g.date.Month,
                                day = g.date.Day,
                            },
                            g => new
                            {
                                _id = g.Key,
                                total = g.Max(m => m.total),
                                filtered = g.Max(m => m.filtered),
                            })
                        .Project(
                            p => new
                            {
                                _id = new DateTime(p._id.year, p._id.month, p._id.day),
                                p.total,
                                p.filtered,
                            })
                        .ToEnumerable();
                }
            );
            #endregion
        }
    }
}
