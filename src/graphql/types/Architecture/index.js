export const schema = `
    type Architecture {
        _id: ID!
        name: String!
        count: Int!
        date: Date!
    }

    type ArchitecturesByDate {
        _id: Date!
        architectures: [Architecture]
    }

    type ArchitectureCount {
        date: String!
        count: Int!
    }

    type ArchitectureTimeline {
        _id: String!
        counts: [ArchitectureCount]
    }

    type Query {
        architecture(_id: ID!): Architecture
        architectureCount: PaginationCount
        architectures(query: Pagination!): [Architecture]
        architecturesByDate(query: Pagination!): [ArchitecturesByDate]
        architectureTimeline(from: Date): [ArchitectureTimeline]
    }
`;
