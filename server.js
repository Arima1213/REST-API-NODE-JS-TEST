const http = require('http');
const url = require('url');
const routes = require('./routes');

// Utility to parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Route matcher utility
function matchRoute(method, pathname) {
  for (const route of routes) {
    const routeParts = route.path.split('/').filter(Boolean);
    const pathParts = pathname.split('/').filter(Boolean);

    if (route.method === method && routeParts.length === pathParts.length) {
      const params = {};
      const match = routeParts.every((part, index) => {
        if (part.startsWith(':')) {
          params[part.substring(1)] = pathParts[index];
          return true;
        }
        return part === pathParts[index];
      });
      if (match) return { handler: route.handler, params };
    }
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const matched = matchRoute(method, pathname);

  if (!matched) {
    res.writeHead(404);
    return res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }

  try {
    req.query = parsedUrl.query;
    req.params = matched.params;
    req.body = await parseBody(req);
  } catch (e) {
    req.body = {};
  }

  try {
    await matched.handler(req, res);
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
