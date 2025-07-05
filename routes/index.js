const productRoutes = require('./productRoutes');
const customerRoutes = require('./customerRoutes');
const supplierRoutes = require('./supplierRoutes');
const transactionRoutes = require('./transactionRoutes');
const stockRoutes = require('./stockRoutes');

module.exports = [
  ...productRoutes,
  ...customerRoutes,
  ...supplierRoutes,
  ...transactionRoutes,
  ...stockRoutes
];
