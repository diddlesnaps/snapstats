// @ts-check

export const schema = `
    type SnapCount {
        _id: ID!
        total: Int!
        filtered: Int!
        date: Date!
    }

    type SnapCountsByDate {
        _id: Date!
        snapCounts: [SnapCount]
    }
    
    type SnapCountTimeline {
        _id: String!
        total: Int!
        filtered: Int!
    }

    type Query {
        snapCount(_id: ID!): SnapCount
        snapCountCount: PaginationCount
        snapCounts(query: Pagination!): [SnapCount]
        snapCountsByDate(query: Pagination!): [SnapCountsByDate]
        snapCountTimeline(from: Date): [SnapCountTimeline]
        snapCountTimelineCount: PaginationCount
    }

    type Mutation {
        addSnapCount(total: Int!, filtered: Int!): SnapCount
    }
`;
