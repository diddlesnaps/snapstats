using GraphQL.Types;
using SnapstatsOrg.Shared.Models.Sections;

namespace SnapstatsOrg.Shared.GraphQL.Types.Sections
{
    public class SectionType : ObjectGraphType<Section>
    {
        public SectionType()
        {
            Field(f => f.date);
            Field(f => f.name);
            Field(f => f.count);
        }
    }
}
