using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using GraphQL;
using GraphQL.Execution;
using GraphQL.Language.AST;
using GraphQL.Resolvers;
using GraphQL.Types;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.Azure.Documents.Linq;
using SnapstatsOrg.Shared.Models;
using SnapstatsOrg.Shared.Models.Derived;
using SnapstatsOrg.Shared.Models.Interfaces;

namespace SnapstatsOrg.Shared.GraphQL.Infrastructure
{
    internal static class ResolveFieldContextExtensions
    {
        public static FieldType FieldAsync<TGraphType, TSourceType>(
            this IObjectGraphType obj,
            string name,
            string? description = null,
            QueryArguments? arguments = null,
            Func<IResolveFieldContext<TSourceType>, Task<object>>? resolve = null,
            string? deprecationReason = null)
            where TGraphType : IGraphType
        {
            return obj.AddField(new FieldType
            {
                Name = name,
                Description = description,
                DeprecationReason = deprecationReason,
                Type = typeof(TGraphType),
                Arguments = arguments,
                Resolver = resolve != null
                    ? new FuncFieldResolver<TSourceType, Task<object>>(resolve)
                    : null,
            });
        }

        public async static Task<Pagination<T>> AddPagination<T>(this IResolveFieldContext<object> context, IQueryable<T> query)
        {
            var docQuery = query.AsDocumentQuery();
            var response = await docQuery.ExecuteNextAsync<T>();
            var continuation = response.ResponseContinuation;
            return new Pagination<T>
            {
                results = response.ToArray(),
                ContinuationToken = continuation ?? ""
            };
        }

        public static SqlQuerySpec ToSqlQuerySpec<TSource>(this IResolveFieldContext<TSource> context) where TSource : new()
        {
            var queryTextStringBuilder = new StringBuilder();

            queryTextStringBuilder.Append("SELECT ");

            queryTextStringBuilder.Append(string.Join(',', context.SubFields.Keys.Select(fieldName => $"c.{fieldName}")));

            queryTextStringBuilder.Append(" FROM c");

            var parameters = new SqlParameterCollection();
            var args = context.Arguments.Where(a => a.Key != "continuationToken" && a.Value.Value is not null and not "");
            if (args.Any())
            {
                queryTextStringBuilder.Append(" WHERE ");

                foreach (KeyValuePair<string, ArgumentValue> argument in args)
                {
                    queryTextStringBuilder.Append($"c.{argument.Key} = @{argument.Key} AND ");

                    if (argument.Value.Value.GetType().IsEnum)
                    {
                        parameters.Add(new SqlParameter("@" + argument.Key, argument.Value.Value.ToString()));
                    }
                    else
                    {
                        parameters.Add(new SqlParameter("@" + argument.Key, argument.Value.Value));
                    }
                }

                queryTextStringBuilder.Length -= 5;
            }

            return new SqlQuerySpec(queryTextStringBuilder.ToString(), parameters);
        }

        public static string? GetFieldForKey<TSource>(Expression<Func<TSource, object?>> keySelector)
        {
            PropertyInfo? key;
            if (keySelector.Body is MemberExpression expr)
            {
                key = expr.Member as PropertyInfo;
            }
            else
            {
                var op = ((UnaryExpression)keySelector.Body).Operand;
                key = ((MemberExpression)op).Member as PropertyInfo;
            }

            var properties = typeof(TSource).GetProperties();
            var filtered = properties.Where(p => p.Name == key?.Name);
            var property = filtered.First();
            var attributes = (JsonPropertyNameAttribute[])property.GetCustomAttributes(typeof(JsonPropertyNameAttribute), true);
            return attributes.First().Name ?? key?.Name;
        }

        public static SqlQuerySpec ToSqlOrderedQuerySpec<TSource>(this IResolveFieldContext<object> context, Expression<Func<TSource, object?>> keySelector, string order = "ASC")
        {
            var queryTextStringBuilder = new StringBuilder();

            queryTextStringBuilder.Append("SELECT ");

            if (context.SubFields.ContainsKey("results"))
            {
                var selections = context.SubFields["results"].SelectionSet.Selections;
                queryTextStringBuilder.Append(string.Join(',', selections.Select(field => $"c.{((Field)field).Name}")));
            }

            queryTextStringBuilder.Append($" FROM {typeof(TSource).Name.ToLowerInvariant()} c");

            var parameters = new SqlParameterCollection();
            var args = context.Arguments.Where(a => a.Key != "continuationToken" && a.Value.Value is not null and not "");
            if (args.Any())
            {
                queryTextStringBuilder.Append(" WHERE ");

                foreach (KeyValuePair<string, ArgumentValue> argument in args)
                {
                    queryTextStringBuilder.Append($"c.{argument.Key} = @{argument.Key} AND ");

                    if (argument.Value.Value.GetType().IsEnum)
                    {
                        parameters.Add(new SqlParameter("@" + argument.Key, argument.Value.Value.ToString()));
                    }
                    else
                    {
                        parameters.Add(new SqlParameter("@" + argument.Key, argument.Value.Value));
                    }
                }

                queryTextStringBuilder.Length -= 5;
            }

            var orderBy = GetFieldForKey(keySelector);

            if (orderBy is not null and not "")
            {
                queryTextStringBuilder.Append($" ORDER BY c.{orderBy} {order}");
            }

            return new SqlQuerySpec(queryTextStringBuilder.ToString(), parameters);
        }

        public static SqlQuerySpec ToSqlFromDateQuerySpec<TSource>(this IResolveFieldContext<TSource> context) where TSource : new()
        {
            var queryTextStringBuilder = new StringBuilder();

            queryTextStringBuilder.Append("SELECT ");

            queryTextStringBuilder.Append(string.Join(',', context.SubFields.Keys.Select(fieldName => $"c.{fieldName}")));

            queryTextStringBuilder.Append($" FROM {typeof(TSource).Name.ToLowerInvariant()} c");

            queryTextStringBuilder.Append(" WHERE c.date > @date");
            var date = context.GetArgument("from", new DateTime(DateTime.Today.Year - 1, DateTime.Today.Month, DateTime.Today.Day));
            var parameters = new SqlParameterCollection()
            {
                new SqlParameter("@date", date)
            };

            return new SqlQuerySpec(queryTextStringBuilder.ToString(), parameters);
        }

        public static SqlQuerySpec ToSqlLimitOneYearQuerySpec<TSource>(this IResolveFieldContext<TSource> context) where TSource : new()
        {
            var queryTextStringBuilder = new StringBuilder();

            queryTextStringBuilder.Append("SELECT ");

            queryTextStringBuilder.Append(string.Join(',', context.SubFields.Keys.Select(fieldName => $"c.{fieldName}")));

            queryTextStringBuilder.Append($" FROM {typeof(TSource).Name.ToLowerInvariant()} c");

            queryTextStringBuilder.Append(" WHERE c.date > @date");
            var date = context.GetArgument("from", new DateTime(DateTime.Today.Year - 1, DateTime.Today.Month, DateTime.Today.Day));
            var parameters = new SqlParameterCollection()
            {
                new SqlParameter("@date", date)
            };

            queryTextStringBuilder.Append(" ORDER BY c.date DESC");

            return new SqlQuerySpec(queryTextStringBuilder.ToString(), parameters);
        }

        public static SqlQuerySpec ToTimelineQuerySpec<TSource>(this IResolveFieldContext<TSource> context)
        {
            var queryTextStringBuilder = new StringBuilder();

            queryTextStringBuilder.Append("SELECT c.name, DateTimePart('m', c.date) as month, Max(c.total) as total, Max(c.filtered) as filtered");
            queryTextStringBuilder.Append($" FROM {typeof(TSource).Name.ToLowerInvariant()} c");

            queryTextStringBuilder.Append(" WHERE c.date > @date");
            var date = context.GetArgument("from", new DateTime(DateTime.Today.Year - 1, DateTime.Today.Month, DateTime.Today.Day));
            var parameters = new SqlParameterCollection()
            {
                new SqlParameter("@date", date)
            };

            queryTextStringBuilder.Append(" GROUP BY month, UPPER(c.name)");

            return new SqlQuerySpec(queryTextStringBuilder.ToString(), parameters);
        }

        public static SqlQuerySpec ToSnapCountTimelineQuerySpec<TSource>(this IResolveFieldContext<TSource> context)
        {
            var queryTextStringBuilder = new StringBuilder();

            queryTextStringBuilder.Append("SELECT DateTimePart('m', c.date) as month, Max(c.total) as total, Max(c.filtered) as filtered");
            queryTextStringBuilder.Append($" FROM {typeof(TSource).Name.ToLowerInvariant()} c");

            queryTextStringBuilder.Append(" WHERE c.date > @date");
            var date = context.GetArgument("from", new DateTime(DateTime.Today.Year - 1, DateTime.Today.Month, DateTime.Today.Day));
            var parameters = new SqlParameterCollection()
            {
                new SqlParameter("@date", date)
            };

            queryTextStringBuilder.Append(" GROUP BY month");

            return new SqlQuerySpec(queryTextStringBuilder.ToString(), parameters);
        }

        public static async Task<string[]> GetVerifiedDeveloperNames(this IResolveFieldContext<object> context, IDocumentClient client, Uri collectionUri, FeedOptions feedOptions)
        {
            var query = client.CreateDocumentQuery<Snap>(
                collectionUri,
                context.As<Snap>().ToDeveloperNamesQuerySpec(),
                feedOptions
            );
            var docQuery = query.AsDocumentQuery();
            var response = await docQuery.ExecuteNextAsync<Snap>();
            return response.Select(s => s.developer_name ?? string.Empty).ToArray();
        }

        public static SqlQuerySpec ToDeveloperNamesQuerySpec(this IResolveFieldContext<Snap> context)
        {
            var queryTextStringBuilder = new StringBuilder();

            queryTextStringBuilder.Append("SELECT DISTINCT(c.developer_name) AS developer_name");
            queryTextStringBuilder.Append($" FROM {typeof(Snap).Name.ToLowerInvariant()} c");

            queryTextStringBuilder.Append(" WHERE c.developer_validation = @developer_validation");
            var parameters = new SqlParameterCollection()
            {
                new SqlParameter("@developer_validation", "verified")
            };

            return new SqlQuerySpec(queryTextStringBuilder.ToString(), parameters);
        }

        public static async Task<uint> GetDocumentCount(this IResolveFieldContext<object> context, IDocumentClient client, Uri collectionUri, FeedOptions feedOptions)
        {
            var query = client.CreateDocumentQuery<dynamic>(
                collectionUri,
                context.ToCountQuerySpec(),
                feedOptions
            );
            var docQuery = query.AsDocumentQuery();
            var response = await docQuery.ExecuteNextAsync<dynamic>();
            return (uint)response.Count;
        }

        public static SqlQuerySpec ToCountQuerySpec<TSource>(this IResolveFieldContext<TSource> context)
        {
            var queryTextStringBuilder = new StringBuilder();

            queryTextStringBuilder.Append("SELECT DISTINCT(c.publisher_username)");
            queryTextStringBuilder.Append($" FROM {typeof(TSource).Name.ToLowerInvariant()} c");

            var args = context.Arguments.Where(a => a.Value.Value is not null and not "");
            var parameters = new SqlParameterCollection();
            if (args.Any())
            {
                queryTextStringBuilder.Append(" WHERE ");

                foreach (KeyValuePair<string, ArgumentValue> argument in args)
                {
                    queryTextStringBuilder.Append($"c.{argument.Key} = @{argument.Key} AND ");

                    if (argument.Value.Value.GetType().IsEnum)
                    {
                        parameters.Add(new SqlParameter("@" + argument.Key, argument.Value.Value.ToString()));
                    }
                    else
                    {
                        parameters.Add(new SqlParameter("@" + argument.Key, argument.Value.Value));
                    }
                }

                queryTextStringBuilder.Length -= 5;
            }

            return new SqlQuerySpec(queryTextStringBuilder.ToString(), parameters);
        }
    }
}
