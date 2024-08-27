const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');



// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // To parse JSON bodies

// Test route
app.get('/', (req, res) => {
  res.send('Welcome to the Banking System API');
});

// Users routes
app.get('/users', async (req, res) => {
  const User = require('./models/User');
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/users', async (req, res) => {
  const User = require('./models/User');
  const { name, email, password_hash, phone_number, address } = req.body;
  try {
    const newUser = new User({ name, email, password_hash, phone_number, address });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Accounts routes
app.get('/accounts', async (req, res) => {
  const Account = require('./models/Account');
  try {
    const accounts = await Account.find();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/accounts', async (req, res) => {
  const Account = require('./models/Account');
  const { user_id, account_type, balance, currency } = req.body;
  try {
    const newAccount = new Account({ user_id, account_type, balance, currency });
    const savedAccount = await newAccount.save();
    res.status(201).json(savedAccount);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add similar routes for Transactions, Cards, Expenses, Categories, and Budgets as needed

// Start server
const PORT =5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
