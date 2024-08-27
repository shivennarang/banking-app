const mongoose = require('mongoose');

// MongoDB URI directly included
const mongoURI = 'mongodb://localhost:27017/banking-system';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = connectDB;
