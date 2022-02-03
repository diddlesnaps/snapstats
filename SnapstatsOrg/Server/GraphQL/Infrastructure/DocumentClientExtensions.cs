using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using System;
using System.Linq;

namespace SnapstatsOrg.Server.GraphQL.Infrastructure
{
    internal static class DocumentClientExtensions
    {
        public static IQueryable<T> CreateDocumentQueryWithPagination<T>(this IDocumentClient documentClient, Uri collectionUri, SqlQuerySpec sqlSpec, FeedOptions feedOptions, string? continuationToken)
        {
            if (continuationToken is not null and not "")
            {
                feedOptions.RequestContinuation = continuationToken;
            }
            return documentClient.CreateDocumentQuery<T>(collectionUri, sqlSpec, feedOptions);
        }
    }
}
