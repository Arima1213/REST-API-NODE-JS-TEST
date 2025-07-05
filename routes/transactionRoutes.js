const { createTransaction, getTransactions, getTransactionById } = require('../controllers/transactionController');

module.exports = [
  { method: 'POST', path: '/transactions', handler: createTransaction },
  { method: 'GET', path: '/transactions', handler: getTransactions },
  { method: 'GET', path: '/transactions/:id', handler: getTransactionById }
];
