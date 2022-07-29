using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SnapstatsOrg.Shared.GraphQL;
using SnapstatsOrg.Shared.Models;
using System.Globalization;
using System.Xml.Linq;

namespace SnapstatsOrg.Server.Sitemap
{
    public class SitemapImpl
    {
        public string GetSitemapDocument(IEnumerable<SitemapNode> sitemapNodes)
        {
            XNamespace xmlns = "http://www.sitemaps.org/schemas/sitemap/0.9";
            XElement root = new(xmlns + "urlset");

            foreach (SitemapNode sitemapNode in sitemapNodes)
            {
                XElement? lastModified = null;
                if (sitemapNode.LastModified is not null)
                {
                    lastModified = new XElement(
                        xmlns + "lastmod",
                        sitemapNode.LastModified.Value.ToLocalTime().ToString("yyyy-MM-ddTHH:mm:sszzz"));
                }
                XElement? frequency = null;
                if (sitemapNode.Frequency is not null)
                {
                    frequency = new XElement(
                        xmlns + "changefreq",
                        sitemapNode.Frequency.Value.ToString().ToLowerInvariant());
                }
                XElement? priority = null;
                if (sitemapNode.Priority is not null)
                {
                    priority = new XElement(
                        xmlns + "priority",
                        sitemapNode.Priority.Value.ToString("F1", CultureInfo.InvariantCulture));
                }
                XElement urlElement = new(
                    xmlns + "url",
                    new XElement(xmlns + "loc", sitemapNode.Url),
                    lastModified,
                    frequency,
                    priority
                );
                root.Add(urlElement);
            }

            XDocument document = new(root);
            return document.ToString();
        }

        public IReadOnlyCollection<SitemapNode> GetSitemapNodes(IMongoDatabase db, IUrlHelper urlHelper)
        {
            List<SitemapNode> nodes = new List<SitemapNode>();

            nodes.Add(
                new SitemapNode()
                {
                    Url = urlHelper.AbsoluteRouteUrl("/"),
                    Priority = 1
                });
            nodes.Add(
               new SitemapNode()
               {
                   Url = urlHelper.AbsoluteRouteUrl("/about"),
                   Priority = 0.9
               });
            nodes.Add(
               new SitemapNode()
               {
                   Url = urlHelper.AbsoluteRouteUrl("/architectures"),
                   Priority = 0.9
               });
            nodes.Add(
               new SitemapNode()
               {
                   Url = urlHelper.AbsoluteRouteUrl("/bases"),
                   Priority = 0.9
               });
            nodes.Add(
               new SitemapNode()
               {
                   Url = urlHelper.AbsoluteRouteUrl("/channels"),
                   Priority = 0.9
               });
            nodes.Add(
               new SitemapNode()
               {
                   Url = urlHelper.AbsoluteRouteUrl("/confinements"),
                   Priority = 0.9
               });
            nodes.Add(
               new SitemapNode()
               {
                   Url = urlHelper.AbsoluteRouteUrl("/developers"),
                   Priority = 0.9
               });
            nodes.Add(
               new SitemapNode()
               {
                   Url = urlHelper.AbsoluteRouteUrl("/licenses"),
                   Priority = 0.9
               });
            nodes.Add(
               new SitemapNode()
               {
                   Url = urlHelper.AbsoluteRouteUrl("/privacy"),
                   Priority = 0.9
               });
            nodes.Add(
               new SitemapNode()
               {
                   Url = urlHelper.AbsoluteRouteUrl("/sections"),
                   Priority = 0.9
               });
            nodes.Add(
               new SitemapNode()
               {
                   Url = urlHelper.AbsoluteRouteUrl("/snaps"),
                   Priority = 0.9
               });

            foreach (string? snapName in db.GetCollection<Snap>(Constants.SNAPS_COLLECTION_NAME)
                .AsQueryable()
                .Select(s => s.name)
                .Distinct()
                .AsEnumerable())
            {
                if (string.IsNullOrWhiteSpace(snapName))
                {
                    continue;
                }

                nodes.Add(
                   new SitemapNode()
                   {
                       Url = urlHelper.AbsoluteRouteUrl($"/snaps/{Uri.EscapeDataString(snapName)}"),
                       Frequency = SitemapFrequency.Weekly,
                       Priority = 0.8
                   });
            }

            foreach (string? publisher in db.GetCollection<Snap>(Constants.SNAPS_COLLECTION_NAME)
                .AsQueryable()
                .Select(s => s.publisher_username)
                .Distinct()
                .AsEnumerable())
            {
                if (string.IsNullOrWhiteSpace(publisher))
                {
                    continue;
                }

                nodes.Add(
                   new SitemapNode()
                   {
                       Url = urlHelper.AbsoluteRouteUrl($"/publishers/{Uri.EscapeDataString(publisher)}"),
                       Frequency = SitemapFrequency.Weekly,
                       Priority = 0.8
                   });
            }

            return nodes;
        }
    }

    public static class UrlHelperExtensions
    {
        public static string AbsoluteRouteUrl(
            this IUrlHelper urlHelper,
            string routeName,
            object? routeValues = null)
        {
            string scheme = urlHelper.ActionContext.HttpContext.Request.Scheme;
            string host = urlHelper.ActionContext.HttpContext.Request.Host.ToString();
            return $"{scheme}://{host}{routeName}";
        }
    }
}
