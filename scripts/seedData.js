const mongoose = require('mongoose');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Card = require('../models/Card');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const Budget = require('../models/Budget');

const mongoURI = 'mongodb://localhost:27017/banking-system';
const seedData = async () => {
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Seed users
  const user = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    password_hash: 'hashed_password',
    phone_number: '1234567890',
    address: '123 Main St',
  });

  // Seed accounts
  const account = await Account.create({
    user_id: user._id,
    account_type: 'savings',
    balance: 1000,
    currency: 'USD',
  });

  // Seed transactions
  await Transaction.create({
    account_id: account._id,
    transaction_type: 'deposit',
    amount: 500,
    currency: 'USD',
    transaction_date: new Date(),
    description: 'Initial deposit',
  });

  // Seed cards
  await Card.create({
    user_id: user._id,
    account_id: account._id,
    card_type: 'debit',
    card_number: '1234567890123456',
    expiry_date: new Date('2025-12-31'),
  });

  // Seed categories
  const category = await Category.create({
    category_name: 'Food',
    user_id: user._id,
  });

  // Seed expenses
  await Expense.create({
    user_id: user._id,
    amount: 50,
    currency: 'USD',
    category: 'Food',
    transaction_date: new Date(),
    description: 'Grocery shopping',
  });

  // Seed budgets
  await Budget.create({
    user_id: user._id,
    category_id: category._id,
    budget_amount: 500,
    currency: 'USD',
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-12-31'),
  });

  console.log('Data seeded');
  mongoose.connection.close();
};

seedData();
