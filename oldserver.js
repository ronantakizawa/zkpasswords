// Import necessary modules
const express = require('express');
const cors = require('cors');

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

//UUID to connect to database
const uuid = '96644693-6cfb-4c2e-a4b3-c52760255a43';


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

app.post('/set-password', async (req, res) => {
  const { newEmail,newPassword } = req.body;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  var emailRegex = /\S+@\S+\.\S+/;
  if (newPassword === '' || newEmail === '') {
    return res.status(400).json({message:"Email and password cannot be empty"});
  }
  if(!emailRegex.test(newEmail)){
    return res.status(400).json({message:"Invalid Email Format"});

  }
  if (newPassword.length > 20) {
    return res.status(400).json({message:"Password must be less than 20 characters"});
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({message:"Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one symbol"});
  }
  try {

    const response = await fetch('http://localhost:8080/set-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'UUID': uuid
      },
      body: JSON.stringify({ newEmail, newPassword }),
    });
    const data = await response.json();

    if(data.message!=="Password setup successfully"){
      return res.status(400).json({message:data.message});
    }

    return res.json(data);
  } catch (error) {
    console.error('Error during fetch operation:', error.message);
    res.status(500).send('An error occurred while connecting to the databse');
  }
});


// New route for checking email and password
app.post('/check-password', async (req, res) => {
  try {
    const { emailAttempt, passwordAttempt } = req.body;
    if (emailAttempt === '' || passwordAttempt === '') {
      return res.json({message:"Email and Password cannot be empty"})
    }

    const response = await fetch('http://localhost:8080/check-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'UUID': uuid
      },
      body: JSON.stringify({ emailAttempt, passwordAttempt }),
    });

    const data = await response.json();
    return res.json({message:data.message});

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