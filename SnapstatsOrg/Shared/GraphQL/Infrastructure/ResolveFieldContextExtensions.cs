using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using GraphQL;
using MongoDB.Driver;
using SnapstatsOrg.Shared.Models;

namespace SnapstatsOrg.Shared.GraphQL.Infrastructure
{
    internal static class ResolveFieldContextExtensions
    {
        public static IFindFluent<Snap, Snap> FindSnaps(this IResolveFieldContext<object> context, IMongoDatabase db)
        {
            var query = Builders<Snap>.Filter.Empty;

            var name = context.GetArgument<string>("name");
            if (!string.IsNullOrWhiteSpace(name))
            {
                var re = new MongoDB.Bson.BsonRegularExpression(name, "i");
                query &= Builders<Snap>.Filter.Or(
                    Builders<Snap>.Filter.Regex(r => r.name, re),
                    Builders<Snap>.Filter.Regex(r => r.title, re),
                    Builders<Snap>.Filter.Regex(r => r.package_name, re)
                );
            }

            var publisherOrDeveloper = context.GetArgument<string>("publisherOrDeveloper");
            if (!string.IsNullOrWhiteSpace(publisherOrDeveloper))
            {
                var re = new MongoDB.Bson.BsonRegularExpression(publisherOrDeveloper, "i");
                query &= Builders<Snap>.Filter.Or(
                    Builders<Snap>.Filter.Regex(r => r.publisher, re),
                    Builders<Snap>.Filter.Regex(r => r.publisher_username, re),
                    Builders<Snap>.Filter.Regex(r => r.developer_name, re)
                );
            }

            var baseSnap = context.GetArgument<string>("base");
            if (!string.IsNullOrWhiteSpace(baseSnap))
            {
                query &= Builders<Snap>.Filter.Eq(e => e.base_snap, baseSnap);
            }

            var architecture = context.GetArgument<string>("architecture");
            if (!string.IsNullOrWhiteSpace(architecture))
            {
                query &= Builders<Snap>.Filter.AnyEq(e => e.architecture, architecture);
            }

            //var category = context.GetArgument<string>("category");
            //if (!string.IsNullOrWhiteSpace(categories))
            //{
            //    query &= Builders<Snap>.Filter.AnyEq(e => e.categories, category);
            //}

            var license = context.GetArgument<string>("license");
            if (!string.IsNullOrWhiteSpace(license))
            {
                var re = new MongoDB.Bson.BsonRegularExpression(license, "i");
                query &= Builders<Snap>.Filter.Regex(e => e.license, re);
            }

            var validation = context.GetArgument<Validation>("developer_validation");
            if (validation == Validation.verified)
            {
                query &= Builders<Snap>.Filter.Eq(e => e.developer_validation, "verified");
            }

            return db.GetCollection<Snap>(Constants.SNAPS_COLLECTION_NAME)
                .Find(query);
        }
    }
}
