const db = require('../db/db');

module.exports = class Customer {
  static async add(id, name, category = 'regular') {
    if (!id || !name) throw new Error('Invalid customer parameters');
    const allowed = ['regular', 'vip'];
    if (!allowed.includes(category)) throw new Error('Invalid category value');
    await db.query('INSERT INTO customers (id, name, category) VALUES (?, ?, ?)', [id, name, category]);
  }

  static async getAll() {
    const [rows] = await db.query('SELECT * FROM customers');
    return rows;
  }

  static async update(id, updates) {
    if (!id || typeof updates !== 'object') throw new Error('Invalid parameters');
    const fields = [],
      values = [];
    for (const key in updates) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
    values.push(id);
    await db.query(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static async delete(id) {
    await db.query('DELETE FROM customers WHERE id = ?', [id]);
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (rows.length === 0) throw new Error('Customer not found');
    return rows[0];
  }
};
