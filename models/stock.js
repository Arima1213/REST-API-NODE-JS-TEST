const db = require('../db/db');

module.exports = class Stock {
  static async getInventoryValue() {
    const [rows] = await db.query('SELECT price, stock FROM products');
    return rows.reduce((total, row) => total + row.price * row.stock, 0);
  }

  static async getLowStock() {
    const [rows] = await db.query('SELECT * FROM products WHERE stock < 5');
    return rows;
  }

  static async getAll() {
    const [rows] = await db.query('SELECT id, name, stock FROM products');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT id, name, stock FROM products WHERE id = ?', [id]);
    if (rows.length === 0) throw new Error('Product not found');
    return rows[0];
  }

  static async update(id, stock) {
    if (typeof stock !== 'number') throw new Error('Stock must be a number');
    const [result] = await db.query('UPDATE products SET stock = ? WHERE id = ?', [stock, id]);
    if (result.affectedRows === 0) throw new Error('Product not found or stock unchanged');
  }
};
