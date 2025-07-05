const { createSupplier, getSuppliers, updateSupplier, deleteSupplier } = require('../controllers/supplierController');

module.exports = [
  { method: 'POST', path: '/suppliers', handler: createSupplier },
  { method: 'GET', path: '/suppliers', handler: getSuppliers },
  { method: 'PUT', path: '/suppliers/:id', handler: updateSupplier },
  { method: 'DELETE', path: '/suppliers/:id', handler: deleteSupplier }
];