export const schema = `
    type Base {
        _id: ID!
        name: String!
        count: Int!
        date: Date!
    }

    type BasesByDate {
        _id: Date!
        bases: [Base]
    }

    type BaseCount {
        date: String!
        count: Int!
    }

    type BaseTimeline {
        _id: String!
        counts: [BaseCount]
    }

    type Query {
        base(_id: ID!): Base
        baseCount: PaginationCount
        bases(query: Pagination!): [Base]
        basesByDate(query: Pagination!): [BasesByDate]
        baseTimeline(from: Date): [BaseTimeline]
    }

    type Mutation {
        addBase(name: String!, count: Int!): Base
    }
`;
