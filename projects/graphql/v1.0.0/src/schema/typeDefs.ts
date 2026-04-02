export const typeDefs = `#graphql
  type Query {
    hello: String
    health: Health
  }

  type Health {
    status: String!
    timestamp: String!
  }
`;
