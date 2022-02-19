using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using MongoDB.Driver;
using System.Net.Mime;
using System.Text;

namespace SnapstatsOrg.Server.Sitemap
{
    public class SitemapModel : PageModel
    {
        private readonly IMongoDatabase _db;

        public SitemapModel(IMongoDatabase db)
        {
            _db = db;
        }

        public IActionResult OnGet()
        {
            var sm = new SitemapImpl();
            var sitemapNodes = sm.GetSitemapNodes(_db, Url);
            string xml = sm.GetSitemapDocument(sitemapNodes);
            return this.Content(xml, MediaTypeNames.Text.Xml, Encoding.UTF8);
        }
    }
}
