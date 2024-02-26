const fetch = require('node-fetch');

async function setPassword(newUsername, newPassword) {
    if (!newUsername || !newPassword) {
      throw new Error('Username and Password cannot be empty');
    }
  
    if (newUsername.length > 20 || newPassword.length > 20) {
      throw new Error('Username and Password cannot be longer than 20 characters');
    }
  
    try {
      const response = await fetch('http://localhost:8080/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newUsername, newPassword }),
      });
      const data = await response.json();
      if (response.status === 400) {
        throw new Error(data.message);
      }
      return data.message;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  
async function checkPassword(usernameAttempt, passwordAttempt) {
    if (!usernameAttempt || !passwordAttempt) {
      throw new Error('Username and Password cannot be empty');
    }
  
    if (usernameAttempt.length > 20 || passwordAttempt.length > 20) {
      throw new Error('Username and Password cannot be longer than 20 characters');
    }
  
    try {
      const response = await fetch('http://localhost:8080/check-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernameAttempt, passwordAttempt }),
      });
      const data = await response.json();
      if (response.status === 404) {
        throw new Error("Invalid Username");
      }
      return data.logs;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  
module.exports = { setPassword, checkPassword };
  
