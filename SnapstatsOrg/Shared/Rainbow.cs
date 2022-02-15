using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SnapstatsOrg.Shared
{
    public class Rainbow
    {
        const int MAX_RGB = 255;
        const int NUM_SECTIONS = 6;

        public static Color GetColor(decimal index)
        {
            decimal section = Math.Floor(index * NUM_SECTIONS);
            int start = (int)((index - (section / NUM_SECTIONS)) * NUM_SECTIONS);
            int end = 1 - start;

            start *= MAX_RGB;
            end *= MAX_RGB;

            return section switch
            {
                0 => Color.FromArgb(255, MAX_RGB, start, 0),
                1 => Color.FromArgb(255, end, MAX_RGB, 0),
                2 => Color.FromArgb(255, 0, MAX_RGB, start),
                3 => Color.FromArgb(255, 0, end, MAX_RGB),
                4 => Color.FromArgb(255, start, 0, MAX_RGB),
                5 => Color.FromArgb(255, MAX_RGB, 0, end),
                _ => throw new ArgumentOutOfRangeException(nameof(index)),
            };
        }

        public static IEnumerable<string> Create(int numberOfColors)
        {
            if (numberOfColors < 0)
            {
                throw new ArgumentOutOfRangeException(nameof(numberOfColors), "Number of colors must be non-negative");
            }
            for (var i = 0; i < numberOfColors; ++i)
            {
                yield return ColorTranslator.ToHtml(GetColor((decimal) i / numberOfColors));
            }
        }
    }
}
