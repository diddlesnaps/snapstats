using GraphQL.Types;

namespace SnapstatsOrg.Shared.GraphQL.Types
{
    public class RatingType : ObjectGraphType<double>
    {
        public RatingType()
        {
            Field(t => t);
        }
    }
}
