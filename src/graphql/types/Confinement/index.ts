// @ts-check

export const schema = `
    type Confinement {
        _id: ID!
        name: String!
        count: Int!
        date: Date!
    }

    type ConfinementsByDate {
        _id: Date!
        confinements: [Confinement]
    }
    
    type ConfinementCount {
        date: String!
        count: Int!
    }

    type ConfinementTimeline {
        _id: String!
        counts: [ConfinementCount]
    }

    type Query {
        confinement(_id: ID!): Confinement
        confinementCount: PaginationCount
        confinements(query: Pagination!): [Confinement]
        confinementsByDate(query: Pagination!): [ConfinementsByDate]
        confinementTimeline(from: Date): [ConfinementTimeline]
    }

    type Mutation {
        addConfinement(name: String!, count: Int!): Confinement
    }
`;
