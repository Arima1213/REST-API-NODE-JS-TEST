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