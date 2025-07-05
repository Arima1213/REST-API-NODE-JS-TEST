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
};