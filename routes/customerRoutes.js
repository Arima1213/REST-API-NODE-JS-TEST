const { createCustomer, getCustomers, updateCustomer, deleteCustomer } = require('../controllers/customerController');

module.exports = [
  { method: 'POST', path: '/customers', handler: createCustomer },
  { method: 'GET', path: '/customers', handler: getCustomers },
  { method: 'PUT', path: '/customers/:id', handler: updateCustomer },
  { method: 'DELETE', path: '/customers/:id', handler: deleteCustomer }
];