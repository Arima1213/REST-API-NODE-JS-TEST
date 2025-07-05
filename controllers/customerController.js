const Customer = require('../models/customer');

exports.createCustomer = async (req, res) => {
  try {
    const { id, name, category } = req.body;
    await Customer.add(id, name, category);
    res.writeHead(201).end(JSON.stringify({ message: 'Customer created' }));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.getAll();
    res.writeHead(200).end(JSON.stringify(customers));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    await Customer.update(req.params.id, req.body);
    res.writeHead(200).end(JSON.stringify({ message: 'Customer updated' }));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.delete(req.params.id);
    res.writeHead(200).end(JSON.stringify({ message: 'Customer deleted' }));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};