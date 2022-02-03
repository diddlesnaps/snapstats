using GraphQL.Types;

namespace SnapstatsOrg.Server.GraphQL.Types
{
    public class RatingType : ObjectGraphType<double>
    {
        public RatingType()
        {
            Field(t => t);
        }
    }
}
