const EventEmitter = require('events');
class StockNotifier extends EventEmitter {}
const notifier = new StockNotifier();
notifier.on('lowStock', ({ productId, stock }) => {
  console.log(`[NOTIFIKASI] Stok produk ${productId} tinggal ${stock}`);
});
module.exports = notifier;