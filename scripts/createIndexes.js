const mongoose = require('mongoose');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Card = require('../models/Card');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const Budget = require('../models/Budget');
const mongoURI = 'mongodb://localhost:27017/banking-system';
const createIndexes = async () => {
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await User.createIndexes();
  await Account.createIndexes();
  await Transaction.createIndexes();
  await Card.createIndexes();
  await Expense.createIndexes();
  await Category.createIndexes();
  await Budget.createIndexes();

  console.log('Indexes created');
  mongoose.connection.close();
};

createIndexes();
