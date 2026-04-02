import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

app.get('/', (c) => {
  return c.json({ message: 'Hello from Hono!' });
});

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3000;

console.log(`Server running on http://localhost:${PORT}`);

serve({
  fetch: app.fetch,
  port: Number(PORT),
});
