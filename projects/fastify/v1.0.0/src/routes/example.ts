import { FastifyInstance } from 'fastify';

export async function exampleRoutes(fastify: FastifyInstance) {
  fastify.get('/api/example', async (_request, _reply) => {
    return { message: 'Hello from Fastify!' };
  });
}
