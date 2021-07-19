using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Derived;

namespace SnapstatsOrg.Shared.GraphQL.Types
{
    public class PaginationType<T> : ObjectGraphType<Pagination<T>>
    {
        public PaginationType()
        {
            Field(t => t.results);
            Field(t => t.ContinuationToken);
        }
    }
}
