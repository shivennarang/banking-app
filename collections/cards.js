const mongoose = require('mongoose');
const { Schema } = mongoose;

// Cards Schema
const cardSchema = new Schema({
  card_id: {
    type: String,
    required: true,
    unique: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the Users collection
    required: true,
  },
  account_id: {
    type: String, // account_id is a string as defined in Account model
    required: true,
  },
  card_type: {
    type: String,
    enum: ['Debit', 'Credit'], // Only allow 'debit' or 'credit'
    required: true,
  },
  card_number: {
    type: String,
    required: true,
    unique: true,
  },
  expiry_date: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});


// Cards Model
const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
