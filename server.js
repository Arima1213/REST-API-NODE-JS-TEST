const http = require('http');
const url = require('url');
const InventoryManager = require('./models/InventoryManager');

// Helper: parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
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

// Helper: parse ID dari URL path seperti /products/:id
function getIdFromPath(pathname) {
  const parts = pathname.split('/');
  return parts.length === 3 ? parts[2] : null;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // POST /products
  if (method === 'POST' && pathname === '/products') {
    try {
      const data = await parseBody(req);
      const { id, name, price, stock, category } = data;

      if (!id || !name || price == null || stock == null || !category) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Missing required fields' }));
      }

      await InventoryManager.addProduct(id, name, price, stock, category);
      res.writeHead(201);
      res.end(JSON.stringify({ message: 'Product added successfully' }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  // GET /products?page=1&limit=10&category=Food
  else if (method === 'GET' && pathname === '/products') {
    try {
      const { page = 1, limit = 10, category } = parsedUrl.query;
      const result = await InventoryManager.getProductsPaginated(
        parseInt(page),
        parseInt(limit),
        category
      );
      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  // PUT /products/:id
  else if (method === 'PUT' && pathname.startsWith('/products/')) {
    try {
      const productId = getIdFromPath(pathname);
      const data = await parseBody(req);
      await InventoryManager.updateProduct(productId, data);
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Product updated successfully' }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  // POST /transactions
  else if (method === 'POST' && pathname === '/transactions') {
    try {
      const data = await parseBody(req);
      const { transactionId, type, customerId, supplierId, items } = data;
      await InventoryManager.createTransaction(
        transactionId,
        type,
        customerId,
        supplierId,
        items
      );
      res.writeHead(201);
      res.end(JSON.stringify({ message: 'Transaction recorded' }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  // GET /reports/inventory
  else if (method === 'GET' && pathname === '/reports/inventory') {
    try {
      const value = await InventoryManager.getInventoryValue();
      res.writeHead(200);
      res.end(JSON.stringify({ inventoryValue: value }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  // GET /reports/low-stock
  else if (method === 'GET' && pathname === '/reports/low-stock') {
    try {
      const result = await InventoryManager.getLowStockProducts();
      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  // Default 404
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

// Jalankan server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
