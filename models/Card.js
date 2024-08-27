const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  card_type: { type: String, enum: ['debit', 'credit'], required: true },
  card_number: { type: String, required: true, unique: true },
  expiry_date: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Card', CardSchema);
