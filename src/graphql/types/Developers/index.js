// @ts-check

export const schema = `
    type DeveloperCount {
        _id: ID!
        total: Int!
        mean: Float!
        mode: Int!
        median: Int!
        date: Date!
    }

    type DeveloperCountsByDate {
        _id: Date!
        developerCounts: [DeveloperCount]
    }

    type DeveloperCountTimeline {
        _id: String!
        total: Int!
        mean: Float!
    }

    type DeveloperNames {
        _id: String!
    }

    type Query {
        developerCount(_id: ID!): DeveloperCount
        developerCountCount: PaginationCount
        developerCounts(query: Pagination!): [DeveloperCount]
        developerCountsByDate(query: Pagination!): [DeveloperCountsByDate]
        developerCountTimeline(from: Date): [DeveloperCountTimeline]
        developerCountTimelineCount: PaginationCount

        verifiedDevelopers: [DeveloperNames]
        verifiedDeveloperCount: PaginationCount
    }

    type Mutation {
        addDeveloperCount(total: Int!, mean: Float!, mode: Int!, median: Int!): DeveloperCount
    }
`;
