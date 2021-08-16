using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Sections;

namespace SnapstatsOrg.Shared.GraphQL.Types.Sections
{
    public class SectionsByDateType : ObjectGraphType<SectionByDate>
    {
        public SectionsByDateType()
        {
            Field(f => f._id);
            Field(f => f.sections);
        }
    }
}
