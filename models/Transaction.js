const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  transaction_type: { type: String, enum: ['deposit', 'withdrawal', 'transfer'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  transaction_date: { type: Date, required: true },
  description: { type: String, required: false },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
