using System.Text.RegularExpressions;

namespace SnapstatsOrg.Client.Data
{
    public enum VideoProvider
    {
        None = 0,
        Asciinema = 1,
        Vimeo = 2,
        Youtube = 3,
    }

    public class VideoType
    {
        public VideoProvider Provider { get; internal set; }

        private string _url = "";

        public string Url
        {
            get => _url;
            set
            {
                (string url, VideoProvider provider) = value switch
                {
                    string v when Regex.Match(v, @"youtube").Success => (value.Replace("watch?v=", "embed/"), VideoProvider.Youtube),
                    string v when Regex.Match(v, @"youtu\.be").Success => (value.Replace("youtu.be", "youtube.com/embed/"), VideoProvider.Youtube),
                    string v when Regex.Match(v, @"vimeo").Success => (value.Replace("vimeo.com/", "player.vimeo.com/video/"), VideoProvider.Vimeo),
                    string v when Regex.Match(v, @"asciinema").Success => ("", VideoProvider.Asciinema),
                    _ => ("", VideoProvider.None)
                };

                url += provider switch
                {
                    VideoProvider.Youtube => "?autoplay=1&mute=1&modestbranding=1&rel=0",
                    VideoProvider.Vimeo => "?title=0&byline=0&portrait=0&transparent=0",
                    _ => "",
                };

                _url = url.Replace("http://", "https://");
                Provider = provider;
            }
        }
    }

}
