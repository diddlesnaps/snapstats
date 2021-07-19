using System;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using GraphQL.Types;
using SnapstatsOrg.Shared.Models;
using GraphQL;
using Microsoft.Azure.Documents.Linq;
using System.Linq;

namespace SnapstatsOrg.Shared.GraphQL.Types
{
    public class SnapAliasType : ObjectGraphType<SnapAlias>
    {
        public SnapAliasType()
        {
            Field(t => t.name);
            Field(t => t.target);
        }
    }

    public class SnapConfinementEnum : EnumerationGraphType<SnapConfinement> { }

    public class ValidationEnum : EnumerationGraphType<Validation> { }

    public class SnapMediaType : ObjectGraphType<SnapMedia>
    {
        public SnapMediaType()
        {
            Field(t => t.type);
            Field(t => t.url);
            Field(t => t.width, nullable: true);
            Field(t => t.height, nullable: true);
        }
    }

    public class PlugType : ObjectGraphType<Plug>
    {
        public PlugType()
        {
            Field(t => t.plug_name);
            Field(t => t._interface).Name("interface");
            Field(t => t.content);
            Field(t => t.default_provider);
        }
    }

    public class SlotType : ObjectGraphType<Slot>
    {
        public SlotType()
        {
            Field(t => t.slot_name);
            Field(t => t._interface).Name("interface");
        }
    }

    public class SnapType : ObjectGraphType<Snap>
    {
        private static readonly Uri _planetsCollectionUri = UriFactory.CreateDocumentCollectionUri(Constants.DATABASE_NAME, Constants.SNAPS_COLLECTION_NAME);
        private static readonly FeedOptions _feedOptions = new FeedOptions { MaxItemCount = -1, EnableCrossPartitionQuery = true };

        private readonly IDocumentClient _documentClient;

        public SnapType(IDocumentClient documentClient) //, IDataLoaderContextAccessor dataLoaderContextAccessor)
        {
            _documentClient = documentClient;

            Field(t => t.aliases);
            Field(t => t.anon_download_url);
            Field(t => t.apps);
            Field(t => t.architecture);
            Field(t => t.base_snap);
            Field(t => t.binary_filesize);
            Field(t => t.channel);
            Field(t => t.common_ids);
            Field(t => t.confinement);
            Field(t => t.contact);
            Field(t => t.date_published);
            Field(t => t.description);
            Field(t => t.developer_id);
            Field(t => t.developer_name);
            Field(t => t.developer_validation);
            Field(t => t.download_url);
            Field(t => t.icon_url);
            Field(t => t.last_updated);
            Field(t => t.license);
            Field(t => t.media);
            Field(t => t.name);
            Field(t => t.origin);
            Field(t => t.package_name);
            Field(t => t._private).Name("private");
            Field(t => t.publisher);
            Field(t => t.publisher_username);
            Field(t => t.release);
            Field(t => t.revision);
            Field(t => t.screenshot_urls);
            Field(t => t.sections);
            Field(t => t.snap_id);
            Field(t => t.snap_yaml);
            Field(t => t.summary);
            Field(t => t.support_url);
            Field(t => t.title);
            Field(t => t.trending);
            Field(t => t.unlisted);
            Field(t => t.version);
            Field(t => t.website, nullable: true);
            Field(t => t.plugs);
            Field(t => t.slots);

            FieldAsync<FloatGraphType>(
                "ratings_average",
                resolve: async (context) => {
                    var query = documentClient.CreateDocumentQuery<Rating>(
                        SnapstatsQuery._ratingsCollectionUri,
                        new SqlQuerySpec(
                            "SELECT * FROM c WHERE c.app_id = @id",
                            new SqlParameterCollection() {
                                            new SqlParameter("@id", $"io.snapcraft.{context.Source.package_name}-{context.Source.snap_id}")
                            }
                        ),
                        SnapstatsQuery._feedOptionsOne
                    ).AsDocumentQuery();
                    var rating = (Rating)((await query.ExecuteNextAsync()).FirstOrDefault() ?? new Rating());

                    if (rating.total == 0) return 0;

                    return (
                        rating.star5 * 5
                        + rating.star4 * 4
                        + rating.star3 * 3
                        + rating.star2 * 2
                        + rating.star1
                    ) / (double)rating.total;
                }
            );

            FieldAsync<IntGraphType>(
                "ratings_count",
                resolve: async (context) => {
                    var query = documentClient.CreateDocumentQuery<Rating>(
                        SnapstatsQuery._ratingsCollectionUri,
                        new SqlQuerySpec(
                            "SELECT * FROM c WHERE c.app_id = @id",
                            new SqlParameterCollection() {
                                new SqlParameter("@id", $"io.snapcraft.{context.Source.package_name}-{context.Source.snap_id}")
                            }
                        ),
                        SnapstatsQuery._feedOptionsOne
                    ).AsDocumentQuery();
                    var rating = (Rating)((await query.ExecuteNextAsync()).FirstOrDefault() ?? new Rating());
                    return rating.total;
                }
            );

            //Field<ListGraphType<CharacterType>>(
            //    "characters",
            //    resolve: context => {
            //        var dataLoader = dataLoaderContextAccessor.Context.GetOrAddCollectionBatchLoader<int, Character>("GetCharactersByHomeworldId", GetCharactersByHomeworldIdAsync);

            //        return dataLoader.LoadAsync(context.Source.WorldId);
            //    }
            //);
        }

        //private Task<ILookup<int, Character>> GetCharactersByHomeworldIdAsync(IEnumerable<int> homeworldIds)
        //{
        //    return Task.FromResult(_documentClient.CreateDocumentQuery<Character>(_planetsCollectionUri, _feedOptions)
        //        .Where(c => homeworldIds.Contains(c.HomeworldId))
        //        .ToLookup(c => c.HomeworldId)
        //    );
        //}
    }
}
