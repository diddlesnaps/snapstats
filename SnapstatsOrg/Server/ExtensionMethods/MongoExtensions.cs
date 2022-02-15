using MongoDB.Bson;
using MongoDB.Driver.Linq;
using SnapstatsOrg.Shared.Models;
using System.Globalization;
using System.Linq;

namespace SnapstatsOrg.Server.ExtensionMethods
{
    public static class MongoExtensions
    {
        public static IQueryable<dynamic> GetTimeline<T>(this IQueryable<T> collection) where T : ITimelineable
        {
            return collection
            .Select(s => new
            {
                date = new DateTime(s.date.Year, s.date.Month, s.date.Day),
                s.name,
                s.count,
            })
            .GroupBy(g => new
            {
                g.date,
                g.name,
            })
            .Select(s => new
            {
                s.Key.date,
                s.Key.name,
                count = s.Max(m => m.count),
            })
            .OrderBy(o => o.date)
            .GroupBy(g => g.name)
            .Select(s => new Timeline()
            {
                _id = s.Key,
                counts = s.Select(g => new Count()
                {
                    count = g.count,
                    date = g.date,
                }).ToArray(),
            })
            .OrderBy(o => o._id);
        }
    }
}
