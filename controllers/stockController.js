const Stock = require('../models/stock');

exports.getInventoryValue = async (req, res) => {
  try {
    const total = await Stock.getInventoryValue();
    res.writeHead(200).end(JSON.stringify({ inventoryValue: total }));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const result = await Stock.getLowStock();
    res.writeHead(200).end(JSON.stringify(result));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};

exports.getAllStock = async (req, res) => {
  try {
    const result = await Stock.getAll();
    res.writeHead(200).end(JSON.stringify(result));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};

exports.getStockById = async (req, res) => {
  try {
    const result = await Stock.getById(req.params.id);
    res.writeHead(200).end(JSON.stringify(result));
  } catch (err) {
    res.writeHead(404).end(JSON.stringify({ error: err.message }));
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    await Stock.update(req.params.id, stock);
    res.writeHead(200).end(JSON.stringify({ message: 'Stock updated' }));
  } catch (err) {
    res.writeHead(400).end(JSON.stringify({ error: err.message }));
  }
};
