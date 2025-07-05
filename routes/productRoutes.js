const { createProduct, getProducts, updateProduct, deleteProduct } = require('../controllers/productController');

module.exports = [
  { method: 'POST', path: '/products', handler: createProduct },
  { method: 'GET', path: '/products', handler: getProducts },
  { method: 'PUT', path: '/products/:id', handler: updateProduct },
  { method: 'DELETE', path: '/products/:id', handler: deleteProduct }
];