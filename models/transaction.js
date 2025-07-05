const db = require('../db/db');

module.exports = class Transaction {
  static async create(transactionId, type, customerId, supplierId, items) {
    if (!transactionId || !['sale', 'purchase'].includes(type) || !Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid transaction parameters');
    }

    await db.beginTransaction();
    try {
      await db.query('INSERT INTO transactions (id, type, customer_id, supplier_id) VALUES (?, ?, ?, ?)', [transactionId, type, customerId || null, supplierId || null]);

      for (const item of items) {
        const { productId, quantity } = item;
        const [rows] = await db.query('SELECT price, stock FROM products WHERE id = ?', [productId]);
        if (rows.length === 0) throw new Error(`Product not found: ${productId}`);

        const product = rows[0];
        if (type === 'sale' && product.stock < quantity) {
          throw new Error(`Insufficient stock for product ${productId}`);
        }

        const unitPrice = product.price;
        let discount = 0;
        if (type === 'sale' && quantity >= 10) discount = 0.1 * unitPrice * quantity;

        await db.query('INSERT INTO transaction_details (transaction_id, product_id, quantity, unit_price, discount) VALUES (?, ?, ?, ?, ?)', [transactionId, productId, quantity, unitPrice, discount]);

        const newStock = type === 'sale' ? product.stock - quantity : product.stock + quantity;
        if (newStock < 0) throw new Error(`Resulting stock can't be negative`);

        await db.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);
      }

      await db.commit();
    } catch (err) {
      await db.rollback();
      throw err;
    }
  }

  static async getAll() {
    const [rows] = await db.query(`
      SELECT t.id, t.type, t.customer_id, c.name AS customer_name, t.supplier_id, s.name AS supplier_name, t.created_at
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN suppliers s ON t.supplier_id = s.id
      ORDER BY t.created_at DESC
    `);
    return rows;
  }

  static async getById(transactionId) {
    const [header] = await db.query(`
      SELECT t.id, t.type, t.created_at, t.customer_id, c.name AS customer_name, t.supplier_id, s.name AS supplier_name
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN suppliers s ON t.supplier_id = s.id
      WHERE t.id = ?
    `, [transactionId]);

    if (header.length === 0) throw new Error('Transaction not found');

    const [details] = await db.query(`
      SELECT td.product_id, p.name AS product_name, td.quantity, td.unit_price, td.discount
      FROM transaction_details td
      JOIN products p ON td.product_id = p.id
      WHERE td.transaction_id = ?
    `, [transactionId]);

    return {
      ...header[0],
      items: details
    };
  }
};
