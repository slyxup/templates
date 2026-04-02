export const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL!',
    health: () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }),
  },
};
