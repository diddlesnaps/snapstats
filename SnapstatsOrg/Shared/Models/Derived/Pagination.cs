using System.Collections.Generic;

namespace SnapstatsOrg.Shared.Models.Derived
{
    public class Pagination<T>
    {
        public T[]? results { get; set; }
        public string? ContinuationToken { get; set; }
    }
}
