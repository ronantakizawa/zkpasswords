// Import necessary modules
const express = require('express');
const cors = require('cors');
const ZKAuth = require('zkauth');

const zk = new ZKAuth();

// Initialize express app
const app = express();
const port = 3000;

//CORS
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'POST',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));


app.use(express.json()); // Parse JSON bodies

// Static files
app.use(express.static('public'));

// Routes for serving HTML files
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});
app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: 'public' });
});
app.get('/signup', (req, res) => {
  res.sendFile('signup.html', { root: 'public' });
});
app.get('/change', (req, res) => {
  res.sendFile('change.html', { root: 'public' });
});

app.post('/set-password', async (req, res) => {
  try {
    const { newEmail,newPassword } = req.body;
    const response = await zk.setPassword(newEmail,newPassword);
    return res.status(response.status).json({message:response.message});
    
  } catch (error) {
    console.error('Error during fetch operation:', error.message);
    res.status(500).send('An error occurred while connecting to the databse');
  }
});


// New route for checking email and password
app.post('/check-password', async (req, res) => {
  try {
    const { emailAttempt, passwordAttempt } = req.body;
    const response = await zk.checkPassword(emailAttempt, passwordAttempt);
    return res.status(response.status).json({message:response.message});
  } catch (error) {
    // Handle errors, such as network issues or JSON parsing problems
    console.error('Error during fetch operation:', error.message);
    res.status(500).send('An error occurred while connecting to the databse');
  }
});

app.post('/change-password', async (req, res) => {
  try {
    const { newEmail, newPassword } = req.body;
    const response = await zk.changePassword(newEmail, newPassword);
    return res.status(response.status).json({message:response.message});
  } catch (error) {
    // Handle errors, such as network issues or JSON parsing problems
    console.error('Error during fetch operation:', error.message);
    res.status(500).send('An error occurred while connecting to the databse');
  }
});




// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
