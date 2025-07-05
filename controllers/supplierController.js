const Supplier = require('../models/supplier');

exports.createSupplier = async (req, res) => {
  try {
    const { id, name } = req.body;
    await Supplier.add(id, name);
    res.writeHead(201).end(JSON.stringify({ message: 'Supplier created' }));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};

exports.getSuppliers = async (req, res) => {
  try {
    const result = await Supplier.getAll();
    res.writeHead(200).end(JSON.stringify(result));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    await Supplier.update(req.params.id, req.body);
    res.writeHead(200).end(JSON.stringify({ message: 'Supplier updated' }));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    await Supplier.delete(req.params.id);
    res.writeHead(200).end(JSON.stringify({ message: 'Supplier deleted' }));
  } catch (err) {
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
};