const Product = require('../models/product');
const AppError = require('../errors/AppError');

exports.createProduct = async (req, res) => {
  try {
    const { id, name, price, stock, category } = req.body;
    await Product.add(id, name, price, stock, category);
    res.writeHead(201).end(JSON.stringify({ message: 'Product created' }));
  } catch (err) {
    res.writeHead(err.statusCode || 500).end(JSON.stringify({ error: err.message }));
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category = null } = req.query;
    const result = await Product.getPaginated(Number(page), Number(limit), category);
    res.writeHead(200).end(JSON.stringify(result));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    await Product.update(productId, req.body);
    res.writeHead(200).end(JSON.stringify({ message: 'Product updated' }));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.writeHead(200).end(JSON.stringify({ message: 'Product deleted' }));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    res.writeHead(200).end(JSON.stringify(product));
  } catch (err) {
    res.writeHead(err.statusCode || 500).end(JSON.stringify({ error: err.message }));
  }
};
