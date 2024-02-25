const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const cors = require('cors'); 

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); 

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

