const db = require('../db/db');

module.exports = class Supplier {
  static async add(id, name) {
    if (!id || !name) throw new Error('Invalid supplier parameters');
    await db.query('INSERT INTO suppliers (id, name) VALUES (?, ?)', [id, name]);
  }

  static async getAll() {
    const [rows] = await db.query('SELECT * FROM suppliers');
    return rows;
  }

  static async update(id, updates) {
    const fields = [], values = [];
    for (const key in updates) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
    values.push(id);
    await db.query(`UPDATE suppliers SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static async delete(id) {
    await db.query('DELETE FROM suppliers WHERE id = ?', [id]);
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM suppliers WHERE id = ?', [id]);
    if (rows.length === 0) throw new Error('Supplier not found');
    return rows[0];
  }
};