const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  account_id: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  account_type: { type: String, required: true },
  balance: { type: Number, required: true },
  currency: { type: String, required: true }
});

module.exports = mongoose.model('Account', accountSchema);
