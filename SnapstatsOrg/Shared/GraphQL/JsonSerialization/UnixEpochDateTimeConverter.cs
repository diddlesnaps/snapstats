using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

sealed class UnixEpochDateTimeConverter : JsonConverter<DateTime>
{
    static readonly DateTime s_epoch = new DateTime(1970, 1, 1, 0, 0, 0);
    static readonly Regex s_regex = new Regex("^/Date\\(([+-]*\\d+)\\)/$", RegexOptions.CultureInvariant);

    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (!reader.TryGetInt64(out long unixTime))
        {
            throw new JsonException();
        }

        return s_epoch.AddMilliseconds(unixTime);
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        long unixTime = Convert.ToInt64((value - s_epoch).TotalMilliseconds);

        writer.WriteNumberValue(unixTime);
    }
}