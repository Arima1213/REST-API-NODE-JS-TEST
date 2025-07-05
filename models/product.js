const db = require('../db/db');

module.exports = class Product {
  static async add(id, name, price, stock, category) {
    if (!id || !name || typeof price !== 'number' || typeof stock !== 'number' || !category) {
      throw new Error('Invalid product parameters');
    }
    const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length > 0) throw new Error('Product ID already exists');
    await db.query('INSERT INTO products (id, name, price, stock, category) VALUES (?, ?, ?, ?, ?)', [id, name, price, stock, category]);
  }

  static async getPaginated(page = 1, limit = 10, category = null) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM products';
    const params = [];
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const [rows] = await db.query(query, params);
    return rows;
  }

  static async update(id, updates) {
    if (!id || typeof updates !== 'object' || Object.keys(updates).length === 0) {
      throw new Error('Invalid update parameters');
    }
    const fields = [], values = [];
    for (const key in updates) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
    values.push(id);
    await db.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw new Error('Product not found');
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) throw new Error('Product not found');
    return rows[0];
  }
};
