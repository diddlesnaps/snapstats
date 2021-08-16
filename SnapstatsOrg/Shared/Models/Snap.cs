using MongoDB.Bson.Serialization.Attributes;
using SnapstatsOrg.Shared.Models;
using System;
using System.Text.Json.Serialization;

namespace SnapstatsOrg.Shared.Models
{
    public enum SnapConfinement
    {
        strict = 1,
        classic = 2,
        devmode = 3,
    }

    public enum Validation
    {
        unproven = 1,
        verified = 2,
    }

    [BsonIgnoreExtraElements]
    public class SnapAlias
    {
        [JsonPropertyName("name")]
        public string? name { get; set; }
        [JsonPropertyName("target")]
        public string? target { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class SnapMedia
    {
        [JsonPropertyName("type")]
        public string? type { get; set; }
        [JsonPropertyName("url")]
        public string? url { get; set; }
        [JsonPropertyName("height")]
        public uint? height { get; set; }
        [JsonPropertyName("width")]
        public uint? width { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class Plug
    {
        [JsonPropertyName("plug_name")]
        public string? plug_name { get; set; }
        [JsonPropertyName("interface")]
        public string? _interface { get; set; }
        [JsonPropertyName("content")]
        public string? content { get; set; }
        [JsonPropertyName("default_provider")]
        public string? default_provider { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class Slot
    {
        [JsonPropertyName("slot_name")]
        public string? slot_name { get; set; }
        [JsonPropertyName("interface")]
        public string? _interface { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class Snap
    {
        [JsonPropertyName("aliases")]
        public SnapAlias[]? aliases { get; set; }
        [JsonPropertyName("anon_download_url")]
        public string? anon_download_url { get; set; }
        [JsonPropertyName("apps")]
        public string[]? apps { get; set; }
        [JsonPropertyName("architecture")]
        public string[]? architecture { get; set; }
        [JsonPropertyName("base_snap")]
        public string? base_snap { get; set; }
        [JsonPropertyName("binary_filesize")]
        public ulong binary_filesize { get; set; }
        [JsonPropertyName("channel")]
        public string? channel { get; set; }
        [JsonPropertyName("common_ids")]
        public string[]? common_ids { get; set; }
        [JsonPropertyName("confinement")]
        public SnapConfinement confinement { get; set; }
        [JsonPropertyName("contact")]
        public string? contact { get; set; }
        [JsonPropertyName("date_published")]
        public DateTime date_published { get; set; }
        [JsonPropertyName("description")]
        public string? description { get; set; }
        [JsonPropertyName("developer_id")]
        public string? developer_id { get; set; }
        [JsonPropertyName("developer_name")]
        public string? developer_name { get; set; }
        [JsonPropertyName("developer_validation")]
        public string developer_validation { get; set; } = "unproven";
        [JsonPropertyName("download_url")]
        public string? download_url { get; set; }
        [JsonPropertyName("icon_url")]
        public string? icon_url { get; set; }
        [JsonPropertyName("last_updated")]
        public DateTime last_updated { get; set; }
        [JsonPropertyName("license")]
        public string? license { get; set; }
        [JsonPropertyName("media")]
        public SnapMedia[]? media { get; set; }
        [JsonPropertyName("name")]
        public string? name { get; set; }
        [JsonPropertyName("origin")]
        public string? origin { get; set; }
        [JsonPropertyName("package_name")]
        public string? package_name { get; set; }
        [JsonPropertyName("private")]
        public bool _private { get; set; }
        [JsonPropertyName("publisher")]
        public string? publisher { get; set; }
        [JsonPropertyName("publisher_username")]
        public string? publisher_username { get; set; }
        [JsonPropertyName("ratings_average")]
        public double ratings_average { get; set; }
        [JsonPropertyName("ratings_count")]
        public uint ratings_count { get; set; }
        [JsonPropertyName("release")]
        public string[]? release { get; set; }
        [JsonPropertyName("revision")]
        public uint revision { get; set; }
        [JsonPropertyName("screenshot_urls")]
        public string[]? screenshot_urls { get; set; }
        [JsonPropertyName("sections")]
        public string[]? sections { get; set; }
        [JsonPropertyName("snap_id")]
        public string? snap_id { get; set; }
        [JsonPropertyName("snap_yaml")]
        public string? snap_yaml { get; set; }
        [JsonPropertyName("summary")]
        public string? summary { get; set; }
        [JsonPropertyName("support_url")]
        public string? support_url { get; set; }
        [JsonPropertyName("title")]
        public string? title { get; set; }
        [JsonPropertyName("trending")]
        public bool trending { get; set; }
        [JsonPropertyName("unlisted")]
        public bool unlisted { get; set; }
        [JsonPropertyName("version")]
        public string? version { get; set; }
        [JsonPropertyName("website")]
        public string? website { get; set; }
        [JsonPropertyName("plugs")]
        public Plug[]? plugs { get; set; }
        [JsonPropertyName("slots")]
        public Slot[]? slots { get; set; }
    }
}
