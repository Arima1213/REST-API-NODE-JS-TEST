const Transaction = require('../models/transaction');

exports.createTransaction = async (req, res) => {
  try {
    const { transactionId, type, customerId, supplierId, items } = req.body;
    await Transaction.create(transactionId, type, customerId, supplierId, items);
    res.writeHead(201).end(JSON.stringify({ message: 'Transaction created' }));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const result = await Transaction.getAll();
    res.writeHead(200).end(JSON.stringify(result));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const result = await Transaction.getById(req.params.id);
    res.writeHead(200).end(JSON.stringify(result));
  } catch (err) {
    res.writeHead(404).end(JSON.stringify({ error: err.message }));
  }
};
exports.getDashboardData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.writeHead(400).end(JSON.stringify({ error: 'Start and end date required' }));
    }

    const salesPerMonth = await Transaction.getSalesPerMonth(startDate, endDate);
    const salesPerCategory = await Transaction.getSalesPerCategory(startDate, endDate);
    const topProducts = await Transaction.getTopProducts(startDate, endDate, 10);

    res.writeHead(200).end(
      JSON.stringify({
        salesPerMonth,
        salesPerCategory,
        topProducts,
      })
    );
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};
