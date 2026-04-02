const PORT = process.env.PORT || 3000;

const server = Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/') {
      return Response.json({
        message: 'Hello from Bun!',
      });
    }

    if (url.pathname === '/api/health') {
      return Response.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    }

    return Response.json(
      { error: 'Not found' },
      { status: 404 }
    );
  },
});

console.log(`Server running on http://localhost:${server.port}`);
