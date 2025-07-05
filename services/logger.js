const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, '../logs/transactions.log');
function logTransaction(entry) {
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
}
module.exports = { logTransaction };