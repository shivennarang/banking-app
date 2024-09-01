const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  loan_id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Automatically generated unique identifier
  account_id: { type: String, ref: 'Account', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loan_type: { type: String, enum: ['Personal', 'Auto', 'Mortgage'], required: true },
  loan_amount: { type: Number, required: true },
  remaining_balance: { type: Number, required: true },
  interest_rate: { type: Number, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  status: { type: String,default:'Active', enum: ['Active', 'Completed', 'Defaulted'], required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});



module.exports = mongoose.model('Loan', LoanSchema);
