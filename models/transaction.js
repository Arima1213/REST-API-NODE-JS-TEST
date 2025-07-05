const db = require('../db/db');

module.exports = class Transaction {
  static async create(transactionId, type, customerId, supplierId, items) {
    if (!transactionId || !['sale', 'purchase'].includes(type) || !Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid transaction parameters');
    }

    const connection = await db.getConnection(); // ambil koneksi dari pool
    try {
      await connection.beginTransaction();

      await connection.query('INSERT INTO transactions (id, type, customer_id, supplier_id) VALUES (?, ?, ?, ?)', [
        transactionId,
        type,
        customerId || null,
        supplierId || null,
      ]);

      for (const item of items) {
        const { productId, quantity } = item;
        const [rows] = await connection.query('SELECT price, stock FROM products WHERE id = ?', [productId]);
        if (rows.length === 0) throw new Error(`Product not found: ${productId}`);

        const product = rows[0];
        if (type === 'sale' && product.stock < quantity) {
          throw new Error(`Insufficient stock for product ${productId}`);
        }

        const unitPrice = product.price;
        let discount = 0;
        if (type === 'sale' && quantity >= 10) discount = 0.1 * unitPrice * quantity;

        await connection.query(
          'INSERT INTO transaction_details (transaction_id, product_id, quantity, unit_price, discount) VALUES (?, ?, ?, ?, ?)',
          [transactionId, productId, quantity, unitPrice, discount]
        );

        const newStock = type === 'sale' ? product.stock - quantity : product.stock + quantity;
        await connection.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);
      }

      await connection.commit();
      connection.release(); // kembalikan koneksi ke pool
    } catch (err) {
      await connection.rollback();
      connection.release(); // tetap release meskipun gagal
      throw err;
    }
  }

  static async getAll() {
    // Ambil semua transaksi beserta detail dan produk terkait
    const [rows] = await db.query(`
        SELECT 
            t.id AS transaction_id, t.type, t.customer_id, c.name AS customer_name, 
            t.supplier_id, s.name AS supplier_name, t.created_at,
            td.id AS detail_id, td.product_id, td.quantity, td.unit_price, td.discount,
            p.name AS product_name, p.category
        FROM transactions t
        LEFT JOIN customers c ON t.customer_id = c.id
        LEFT JOIN suppliers s ON t.supplier_id = s.id
        LEFT JOIN transaction_details td ON t.id = td.transaction_id
        LEFT JOIN products p ON td.product_id = p.id
        ORDER BY t.created_at DESC, td.id ASC
    `);

    // Gabungkan detail ke dalam array items per transaksi
    const transactions = {};
    for (const row of rows) {
      if (!transactions[row.transaction_id]) {
        transactions[row.transaction_id] = {
          id: row.transaction_id,
          type: row.type,
          customer_id: row.customer_id,
          customer_name: row.customer_name,
          supplier_id: row.supplier_id,
          supplier_name: row.supplier_name,
          created_at: row.created_at,
          items: [],
        };
      }
      if (row.detail_id) {
        transactions[row.transaction_id].items.push({
          detail_id: row.detail_id,
          product_id: row.product_id,
          product_name: row.product_name,
          category: row.category,
          quantity: row.quantity,
          unit_price: row.unit_price,
          discount: row.discount,
        });
      }
    }
    return Object.values(transactions);
  }

  static async getById(transactionId) {
    const [header] = await db.query(
      `
      SELECT t.id, t.type, t.created_at, t.customer_id, c.name AS customer_name, t.supplier_id, s.name AS supplier_name
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN suppliers s ON t.supplier_id = s.id
      WHERE t.id = ?
    `,
      [transactionId]
    );

    if (header.length === 0) throw new Error('Transaction not found');

    const [details] = await db.query(
      `
      SELECT td.product_id, p.name AS product_name, td.quantity, td.unit_price, td.discount
      FROM transaction_details td
      JOIN products p ON td.product_id = p.id
      WHERE td.transaction_id = ?
    `,
      [transactionId]
    );

    return {
      ...header[0],
      items: details,
    };
  }

  static async getSalesPerMonth(startDate, endDate) {
    const [rows] = await db.query(
      `
      SELECT 
        DATE_FORMAT(t.created_at, '%Y-%m') AS month,
        SUM(td.unit_price * td.quantity - td.discount) AS total_sales
      FROM transactions t
      JOIN transaction_details td ON t.id = td.transaction_id
      WHERE t.type = 'sale'
        AND DATE(t.created_at) BETWEEN ? AND ?
      GROUP BY month
      ORDER BY month ASC
      `,
      [startDate, endDate]
    );
    return rows;
  }

  static async getSalesPerCategory(startDate, endDate) {
    const [rows] = await db.query(
      `
      SELECT 
        p.category,
        SUM(td.unit_price * td.quantity - td.discount) AS total_sales
      FROM transactions t
      JOIN transaction_details td ON t.id = td.transaction_id
      JOIN products p ON td.product_id = p.id
      WHERE t.type = 'sale'
        AND DATE(t.created_at) BETWEEN ? AND ?
      GROUP BY p.category
      ORDER BY total_sales DESC
      `,
      [startDate, endDate]
    );
    return rows;
  }

  static async getTopProducts(startDate, endDate, limit = 10) {
    const [rows] = await db.query(
      `
    SELECT 
      p.id AS product_id,
      p.name AS product_name,
      SUM(td.unit_price * td.quantity - td.discount) AS total_value
    FROM transactions t
    JOIN transaction_details td ON t.id = td.transaction_id
    JOIN products p ON td.product_id = p.id
    WHERE t.type = 'sale'
      AND DATE(t.created_at) BETWEEN ? AND ?
    GROUP BY p.id, p.name
    ORDER BY total_value DESC
    LIMIT ?
    `,
      [startDate, endDate, limit]
    );
    return rows;
  }
};
