using SnapstatsOrg.Client.Data;
using SnapstatsOrg.Shared.Models;
using System;

namespace SnapstatsOrg.Client.ExtensionMethods
{
    internal static class SnapExtensions
    {
        public static string SnapTitle(this Snap s)
        {
            if (s.title is null or "" && s.package_name is not null and not "")
                return s.package_name;
            return s.title ?? "";
        }

        public static SnapMedia? Banner(this Snap s) => Array.Find(s.media ?? Array.Empty<SnapMedia>(), (item) => item.type == "banner");

        public static SnapMedia[] Screenshots(this Snap s) => Array.FindAll(s.media ?? Array.Empty<SnapMedia>(), (item) => item.type == "screenshot");

        public static VideoType Video(this Snap s)
        {
            var video = Array.Find(s.media ?? Array.Empty<SnapMedia>(), (item) => item.type == "video");
            return new() { Url = video?.url ?? "" };
        }

        public static string MediaHeight(this SnapMedia m) => m.type == "banner" ? m.height?.ToString() ?? "auto" : "240";
        public static string MediaWidth(this SnapMedia m) =>
            (m.height is not null and not 0 && m.width is not null and not 0)
                ? Math.Ceiling((double)m.width * (240 / (double)m.height)).ToString()
                : "auto";
    }
}
