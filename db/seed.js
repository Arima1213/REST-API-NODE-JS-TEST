const db = require('./db');
const { v4: uuidv4 } = require('uuid');

// Dapatkan tanggal acak antara bulan ini dan bulan depan
function randomDateBetweenNowAndNextMonth() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  return new Date(now.getTime() + Math.random() * (nextMonth.getTime() - now.getTime()));
}

async function seedData() {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 🔄 Hapus semua data dengan urutan aman
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE transaction_details');
    await connection.query('TRUNCATE TABLE transactions');
    await connection.query('TRUNCATE TABLE products');
    await connection.query('TRUNCATE TABLE customers');
    await connection.query('TRUNCATE TABLE suppliers');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 👥 Seed Customers
    const customers = [];
    for (let i = 1; i <= 100; i++) {
      customers.push([`CUST${1000 + i}`, `Customer ${i}`, i % 5 === 0 ? 'vip' : 'regular']);
    }
    await connection.query('INSERT INTO customers (id, name, category) VALUES ?', [customers]);

    // 🏢 Seed Suppliers
    const suppliers = [];
    for (let i = 1; i <= 100; i++) {
      suppliers.push([`SUP${1000 + i}`, `Supplier ${i}`]);
    }
    await connection.query('INSERT INTO suppliers (id, name) VALUES ?', [suppliers]);

    // 📦 Seed Products (100 dengan 8 kategori)
    const categories = ['Elektronik', 'Aksesoris', 'Alat Tulis', 'Peralatan Kantor', 'Gadget', 'Kebutuhan Rumah', 'Pakaian', 'Makanan'];
    const products = [];
    for (let i = 1; i <= 100; i++) {
      const id = `P${1000 + i}`;
      const name = `Produk ${i}`;
      const price = 50000 + Math.floor(Math.random() * 500000); // 50rb - 550rb
      const stock = 20 + Math.floor(Math.random() * 100); // 20 - 120
      const category = categories[i % categories.length];
      products.push([id, name, price, stock, category]);
    }
    await connection.query('INSERT INTO products (id, name, price, stock, category) VALUES ?', [products]);

    // Ambil data produk untuk referensi
    const [productData] = await connection.query('SELECT id, price FROM products');

    // 🧾 Seed 3000 transaksi antara bulan ini dan bulan depan
    const transactions = [];
    const transactionDetails = [];

    for (let i = 0; i < 3000; i++) {
      const date = randomDateBetweenNowAndNextMonth();
      const isSale = Math.random() > 0.5;
      const transactionId = 'TRX' + uuidv4().slice(0, 8).toUpperCase();

      const customer = customers[Math.floor(Math.random() * customers.length)][0];
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)][0];

      transactions.push([
        transactionId,
        isSale ? 'sale' : 'purchase',
        isSale ? customer : null,
        isSale ? null : supplier,
        date.toISOString().slice(0, 19).replace('T', ' '),
      ]);

      const numItems = Math.floor(Math.random() * 3) + 1;
      const usedProducts = [];

      for (let j = 0; j < numItems; j++) {
        const product = productData[Math.floor(Math.random() * productData.length)];
        if (usedProducts.includes(product.id)) continue;
        usedProducts.push(product.id);

        const qty = Math.floor(Math.random() * 10) + 1;
        const discount = isSale && qty >= 10 ? 0.1 * product.price * qty : 0;

        transactionDetails.push([transactionId, product.id, qty, product.price, discount]);
      }
    }

    // 🔢 Insert batch transaksi dan detail
    const batchSize = 1000;
    for (let i = 0; i < transactions.length; i += batchSize) {
      await connection.query('INSERT INTO transactions (id, type, customer_id, supplier_id, created_at) VALUES ?', [
        transactions.slice(i, i + batchSize),
      ]);
    }
    for (let i = 0; i < transactionDetails.length; i += batchSize) {
      await connection.query('INSERT INTO transaction_details (transaction_id, product_id, quantity, unit_price, discount) VALUES ?', [
        transactionDetails.slice(i, i + batchSize),
      ]);
    }

    await connection.commit();
    console.log('✅ Seeder berhasil dijalankan.');
  } catch (err) {
    await connection.rollback();
    console.error('❌ Gagal seeding:', err);
  } finally {
    connection.release();
  }
}

seedData();
