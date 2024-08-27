const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: false },
  transaction_date: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Expense', ExpenseSchema);
