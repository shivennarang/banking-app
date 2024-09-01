const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('./collections/users'); 
const Account = require('./collections/accounts'); 
const Transaction=require('./collections/transactions')
const Card=require('./collections/cards')
const Loan=require('./collections/loans')
const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));



app.set('view engine', 'ejs');


mongoose.connect('mongodb://localhost:27017/banking_system', {
   
    serverSelectionTimeoutMS: 5000,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


app.use(session({
  secret: 'shiven123',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

// starting point homepage
app.get('/', (req, res) => {
  res.render('index');
});

//  get-registration page
app.get('/register', (req, res) => {
  res.render('registration');
});

//  post-registration
app.post('/register', async (req, res) => {
    try {
      const { name, email, password, phone_number, address } = req.body;

      if (!name || !email || !password || !phone_number || !address) {
        throw new Error('All fields are required');
      }

      const newUser = new User({
        name,
        email,
        password_hash: password, // Consider hashing the password for security
        phone_number,
        address,
      });

      await newUser.save();
      res.redirect('/login'); 
    } catch (error) {
      console.error('Error creating user:', error.message);
      res.status(500).send('Internal Server Error');
    }
});

// get-login page
app.get('/login', (req, res) => {
  res.render('login', { errorMessage: null });
});

// post-login page
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('login', { errorMessage: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.render('login', { errorMessage: 'Invalid email or password' });
        }

        if (user.password_hash !== password) {
            return res.render('login', { errorMessage: 'Invalid email or password' });
        }

       
        req.session.user_id = user._id;
        req.session.email = user.email;
        req.session.name = user.name;

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error logging in:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// get-dashboard
app.get('/dashboard', async (req, res) => {
    if (!req.session.user_id) {
      return res.redirect('/login');
    }
  
    try {
      
      const accounts = await Account.find({ user_id: req.session.user_id }).exec();
  
     
      const user = await User.findById(req.session.user_id).exec();
      const transactions = await Transaction.find({ user_id: req.session.user_id }).exec();
      res.render('dashboard', {
        accounts, 
        userName: user ? user.name : 'User', 
        transactions
      });
    } catch (error) {
      console.error('Error fetching accounts:', error.message);
      res.status(500).send('Internal Server Error');
    }
  });


// get-account
app.get('/account', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  const generateRandomId = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  };
  res.render('create-account', {
    user_id: req.session.user_id,
    name: req.session.name,
    email: req.session.email,
    account_id:generateRandomId(),
  });
});

// post-account
app.post('/account', async (req, res) => {
    const { account_id, account_type, balance, currency } = req.body;
  
  
    if (!account_id || !account_type || !balance || !currency) {
      return res.status(400).send('All fields are required.');
    }
  
    const newAccount = new Account({
      account_id,
      user_id: req.session.user_id,
      name: req.session.name,
      email: req.session.email,
      account_type,
      balance,
      currency
    });
  
    try {
      await newAccount.save();
     
      res.redirect('/dashboard');
    } catch (error) {
      console.log('Error creating account:', error);
      res.status(500).send('Error creating account');
    }
  });

  // put-account
app.get('/accounts/:id/update', async (req, res) => {
    const { id } = req.params;
  
    try {
      const account = await Account.findById(id).exec();
      if (!account) {
        return res.status(404).send('Account not found');
      }
      res.render('update-account', { name: req.session.name, account });
    } catch (error) {
      console.error('Error fetching account for update:', error.message);
      res.status(500).send('Internal Server Error');
    }
  });
  
  // put-account
  app.post('/accounts/:id/update', async (req, res) => {
    const { id } = req.params;
    const { balance, account_type } = req.body;
  
    try {
      const updatedAccount = await Account.findByIdAndUpdate(id, { balance, account_type }, { new: true }).exec();
      if (!updatedAccount) {
        return res.status(404).send('Account not found');
      }
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Error updating account:', error.message);
      res.status(500).send('Internal Server Error');
    }
  });
  //delete-account
  app.delete('/accounts/:id', async (req, res) => {
    try {
      await Account.findByIdAndDelete(req.params.id);
      res.redirect('/dashboard');
    } catch (err) {
      console.error('Error deleting account:', err);
      res.status(500).send('Internal Server Error');
    }
  });

//get -transactions
  app.get('/transactions', async (req, res) => {
    if (!req.session.user_id) {
      return res.redirect('/login');
    }
    try {
      const accounts = await Account.find({ user_id: req.session.user_id }).exec();
      res.render('create-transactions', {
        name: req.session.name,
        account_id: req.session.account_id, 
        accounts
      });
    } catch (error) {
      console.error('Error fetching accounts for transaction creation:', error.message);
      res.status(500).send('Internal Server Error');
    }
  });
//post-transactions
  app.post('/transactions', async (req, res) => {
    const { account_id: rawAccountId, type, amount, description } = req.body;

   
    let account_id = rawAccountId;
    if (rawAccountId.includes('(ID:')) {
        account_id = rawAccountId.split('(ID:')[1].split(')')[0].trim();
    }

   
    if (!account_id || !type || amount == null) { 
        return res.status(400).send('Account ID, transaction type, and amount are required.');
    }


    const newTransaction = new Transaction({
        user_id: req.session.user_id,
        account_id: account_id, 
        type,
        amount,
        description: description || '', 
        createdAt: new Date()
    });

    try {
       
        await newTransaction.save();

      
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).send('Error creating transaction');
    }
});

// put-transactions
app.get('/transactions/:id/update', async (req, res) => {
  const { id } = req.params;

  try {
  
    const transaction = await Transaction.findById(id).exec();
    if (!transaction) {
      return res.status(404).send('Transactions not found');
    }
    res.render('update-transaction', { name: req.session.name, transaction});
  } catch (error) {
    console.error('Error fetching account for update:', error.message);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/transactions/:id/update', async (req, res) => {
  const { id } = req.params;
  const { account_id, type, amount, description } = req.body;

  console.log('Request Body:', req.body); // Add this line to log the body

  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(id, { account_id, type, amount, description }, { new: true }).exec();
    if (!updatedTransaction) {
      return res.status(404).send('Transaction not found');
    }
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error updating transaction:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/transactions/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/cards',async (req,res)=>{
  const generateRandomId = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  };
  function generateRandom6DigitNumber() {
    
    return Math.floor(Math.random() * 900000) + 100000;
  }
  function getMonthAndYearInFourYears() {
   
    const currentDate = new Date();
    
   
    const futureDate = new Date(currentDate);
    futureDate.setFullYear(currentDate.getFullYear() + 4);
    
   
    const month = futureDate.getMonth() + 1; // Months are zero-indexed, so add 1
    const year = futureDate.getFullYear();
    
   
    const formattedDate = `${month.toString().padStart(2, '0')}/${year}`;
    
    return formattedDate;
  }
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  try {
    const accounts = await Account.find({ user_id: req.session.user_id }).exec();
    const cards = await Card.find({ user_id: req.session.user_id }).exec();
    res.render('cards', {
      name: req.session.name,
      account_id: req.session.account_id, 
      accounts,
      card_id:generateRandomId(),
      user_id:req.session.user_id,
      card_number:generateRandom6DigitNumber(),
      expiry_date:getMonthAndYearInFourYears(),
      cards,

    });
  } catch (error) {
    console.error('Error fetching accounts for transaction creation:', error.message);
    res.status(500).send('Internal Server Error');
  }
})


app.post('/cards', async (req, res) => {
  const {card_id, account_id: rawAccountId, card_type, card_number, expiry_date } = req.body;

 
  let account_id = rawAccountId;
  if (rawAccountId.includes('(ID:')) {
      account_id = rawAccountId.split('(ID:')[1].split(')')[0].trim();
  }

  
  if (!account_id || !card_type || card_number == null) {
      return res.status(400).send('Account ID, transaction type, and amount are required.');
  }

 
  const newCard = new Card({
      card_id,
      user_id: req.session.user_id,
      account_id: account_id,
      card_type,
      card_number,
      expiry_date,
      created_at: new Date()
  });

  try {
     
      await newCard.save();

      
      res.redirect('/cards');
  } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).send('Error creating Card');
  }
});


app.get('/cards/:id/update', async (req, res) => {
  const { id } = req.params;

  try {
  
    const card = await Card.findById(id).exec();
    if (!card) {
      return res.status(404).send('Transactions not found');
    }
    res.render('update-card', { name: req.session.name, card});
  } catch (error) {
    console.error('Error fetching account for update:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/cards/:id/update', async (req, res) => {
  const { id } = req.params;
  const { card_id, user_id, account_id, card_type,card_number,expiry_date } = req.body;

 

  try {
    const updatedCard = await Card.findByIdAndUpdate(id, { card_id, user_id, account_id, card_type,card_number,expiry_date }, { new: true }).exec();
    if (!updatedCard) {
      return res.status(404).send('Transaction not found');
    }
    res.redirect('/cards');
  } catch (error) {
    console.error('Error updating transaction:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/cards/:id', async (req, res) => {
  try {
    await Card.findByIdAndDelete(req.params.id);
    res.redirect('/cards');
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).send('Internal Server Error');
  }
});



//Loans Route

app.get('/loans',async (req,res)=>{
  const loans = await Loan.find({ user_id: req.session.user_id }).exec();
  res.render('loans',{name:req.session.name,loans})
});

app.get('/loans/add',async (req,res)=>{
  const accounts = await Account.find({ user_id: req.session.user_id }).exec();
  res.render('create-loan',{name:req.session.name,accounts,user_id: req.session.user_id,});
})




app.post('/loans', async (req, res) => {
  const { account_id: rawAccountId, loan_type, loan_amount, remaining_balance, interest_rate, start_date, end_date } = req.body;

  console.log('Received account_id:', rawAccountId);
  
  console.log('Received loan_amount:', loan_amount);

  let account_id = rawAccountId;
  if (rawAccountId.includes('(ID:')) {
      account_id = rawAccountId.split('(ID:')[1].split(')')[0].trim();
  }

  console.log('Parsed account_id:', account_id);

  
  if (!account_id || loan_amount == null) {
      return res.status(400).send('Account ID, transaction type, and amount are required.');
  }

 
  const loan = new Loan({
    account_id,
    user_id: req.session.user_id,
    loan_type,
    loan_amount,
    remaining_balance,
    interest_rate,
    start_date,
    end_date,
  });

  try {
     
      await loan.save();

     
      res.redirect('/loans');
  } catch (error) {
      console.error('Error creating loan:', error);
      res.status(500).send('Error creating loan');
  }
});


app.get('/loans/:id/update', async (req, res) => {
  const { id } = req.params;

  try {
  
    const loan = await Loan.findById(id).exec();
    if (!loan) {
      return res.status(404).send('loans not found');
    }
    res.render('update-loans', { name: req.session.name, loan});
  } catch (error) {
    console.error('Error fetching account for update:', error.message);
    res.status(500).send('Internal Server Error');
  }
});



app.post('/loans/:id/update', async (req, res) => {
  const { id } = req.params;
  const { account_id, loan_type, loan_amount, remaining_balance, interest_rate, start_date, end_date ,status} = req.body;

  console.log('Request Body:', req.body); // Add this line to log the body

  try {
    const updatedLoan = await Loan.findByIdAndUpdate(id, {  account_id, loan_type, loan_amount, remaining_balance, interest_rate, start_date, end_date,status }, { new: true }).exec();
    if (!updatedLoan) {
      return res.status(404).send('Loan not found');
    }
    res.redirect('/loans');
  } catch (error) {
    console.error('Error updating transaction:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/loans/:id', async (req, res) => {
  try {
    await Loan.findByIdAndDelete(req.params.id);
    res.redirect('/loans');
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to logout.');
    }

   
    res.redirect('/');
  });
});


const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
