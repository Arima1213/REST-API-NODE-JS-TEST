const { getInventoryValue, getLowStock, getAllStock, getStockById, updateStock } = require('../controllers/stockController');

module.exports = [
  { method: 'GET', path: '/reports/inventory', handler: getInventoryValue },
  { method: 'GET', path: '/reports/low-stock', handler: getLowStock },

  // Master stock routes:
  { method: 'GET', path: '/stocks', handler: getAllStock },
  { method: 'GET', path: '/stocks/:id', handler: getStockById },
  { method: 'PUT', path: '/stocks/:id', handler: updateStock },
];
