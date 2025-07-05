const db = require('../db/db');

/**
 * InventoryManager handles product, customer, supplier, and transaction operations.
 */
class InventoryManager {
    // -------------------------
    // PRODUK
    // -------------------------

    static async addProduct(id, name, price, stock, category) {
        if (!id || !name || typeof price !== 'number' || typeof stock !== 'number' || !category) {
            throw new Error('Invalid product parameters');
        }

        const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [id]);
        if (existing.length > 0) throw new Error('Product ID already exists');

        await db.query(
            'INSERT INTO products (id, name, price, stock, category) VALUES (?, ?, ?, ?, ?)',
            [id, name, price, stock, category]
        );
    }

    static async getProductsPaginated(page = 1, limit = 10, category = null) {
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

    static async updateProduct(productId, updates) {
        if (!productId || typeof updates !== 'object' || Object.keys(updates).length === 0) {
            throw new Error('Invalid update parameters');
        }

        const fields = [];
        const values = [];

        for (const key in updates) {
            fields.push(`${key} = ?`);
            values.push(updates[key]);
        }

        values.push(productId);

        const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
        await db.query(query, values);
    }

    static async deleteProduct(productId) {
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [productId]);
        if (result.affectedRows === 0) throw new Error('Product not found');
    }

    static async getProductById(productId) {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
        if (rows.length === 0) throw new Error('Product not found');
        return rows[0];
    }

    // -------------------------
    // PELANGGAN
    // -------------------------

    static async addCustomer(id, name, category = 'regular') {
        if (!id || !name) throw new Error('Invalid customer parameters');
        await db.query(
            'INSERT INTO customers (id, name, category) VALUES (?, ?, ?)',
            [id, name, category]
        );
    }

    static async getCustomers() {
        const [rows] = await db.query('SELECT * FROM customers');
        return rows;
    }

    static async updateCustomer(id, updates) {
        if (!id || typeof updates !== 'object') throw new Error('Invalid parameters');

        const fields = [];
        const values = [];

        for (const key in updates) {
            fields.push(`${key} = ?`);
            values.push(updates[key]);
        }

        values.push(id);

        await db.query(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    static async deleteCustomer(id) {
        await db.query('DELETE FROM customers WHERE id = ?', [id]);
    }

    static async getCustomerById(id) {
        const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
        if (rows.length === 0) throw new Error('Customer not found');
        return rows[0];
    }

    // -------------------------
    // SUPPLIER
    // -------------------------

    static async addSupplier(id, name) {
        if (!id || !name) throw new Error('Invalid supplier parameters');
        await db.query('INSERT INTO suppliers (id, name) VALUES (?, ?)', [id, name]);
    }

    static async getSuppliers() {
        const [rows] = await db.query('SELECT * FROM suppliers');
        return rows;
    }

    static async updateSupplier(id, updates) {
        const fields = [];
        const values = [];

        for (const key in updates) {
            fields.push(`${key} = ?`);
            values.push(updates[key]);
        }

        values.push(id);

        await db.query(`UPDATE suppliers SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    static async deleteSupplier(id) {
        await db.query('DELETE FROM suppliers WHERE id = ?', [id]);
    }

    static async getSupplierById(id) {
        const [rows] = await db.query('SELECT * FROM suppliers WHERE id = ?', [id]);
        if (rows.length === 0) throw new Error('Supplier not found');
        return rows[0];
    }

    // -------------------------
    // TRANSAKSI
    // -------------------------

    static async createTransaction(transactionId, type, customerId, supplierId, items) {
        if (!transactionId || !['sale', 'purchase'].includes(type) || !Array.isArray(items) || items.length === 0) {
            throw new Error('Invalid transaction parameters');
        }

        await db.beginTransaction();
        try {
            await db.query(
                `INSERT INTO transactions (id, type, customer_id, supplier_id) VALUES (?, ?, ?, ?)`,
                [transactionId, type, customerId || null, supplierId || null]
            );

            for (const item of items) {
                const { productId, quantity } = item;
                if (!productId || typeof quantity !== 'number' || quantity <= 0) {
                    throw new Error('Invalid item in transaction');
                }

                const [rows] = await db.query('SELECT price, stock FROM products WHERE id = ?', [productId]);
                if (rows.length === 0) throw new Error(`Product not found: ${productId}`);

                const product = rows[0];

                if (type === 'sale' && product.stock < quantity) {
                    throw new Error(`Insufficient stock for product ${productId}`);
                }

                const unitPrice = product.price;
                let discount = 0;

                if (type === 'sale' && quantity >= 10) {
                    discount = 0.1 * unitPrice * quantity;
                }

                await db.query(
                    `INSERT INTO transaction_details (transaction_id, product_id, quantity, unit_price, discount)
                     VALUES (?, ?, ?, ?, ?)`,
                    [transactionId, productId, quantity, unitPrice, discount]
                );

                const newStock = type === 'sale'
                    ? product.stock - quantity
                    : product.stock + quantity;

                if (newStock < 0) throw new Error(`Resulting stock can't be negative`);

                await db.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);
            }

            await db.commit();
        } catch (err) {
            await db.rollback();
            throw err;
        }
    }

    // -------------------------
    // REPORT
    // -------------------------

    static async getInventoryValue() {
        const [rows] = await db.query('SELECT price, stock FROM products');
        return rows.reduce((total, row) => total + row.price * row.stock, 0);
    }

    static async getLowStockProducts() {
        const [rows] = await db.query('SELECT * FROM products WHERE stock < 5');
        return rows;
    }
}

module.exports = InventoryManager;
