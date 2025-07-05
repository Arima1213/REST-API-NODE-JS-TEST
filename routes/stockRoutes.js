const { getInventoryValue, getLowStock } = require('../controllers/stockController');

module.exports = [
  { method: 'GET', path: '/reports/inventory', handler: getInventoryValue },
  { method: 'GET', path: '/reports/low-stock', handler: getLowStock }
];