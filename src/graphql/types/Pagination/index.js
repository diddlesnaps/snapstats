export const schema = `
input Sort {
    field: String!
    order: Int!
}

input Pagination {
    offset: Int
    limit: Int
    sort: Sort
}

type PaginationCount {
    count: Int
}
`;
