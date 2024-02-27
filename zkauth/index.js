const fetch = require('node-fetch');

class ZKAuth {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async setPassword(newEmail, newPassword) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    var emailRegex = /\S+@\S+\.\S+/;
    if (newPassword === '' || newEmail === '') {
      return { status:400, message: "Email and password cannot be empty" };
    }
    if (!emailRegex.test(newEmail)) {
      return { status:400, message: "Invalid Email Format" };
    }
    if (newPassword.length > 20) {
      return { status:400, message: "Password must be less than 20 characters" };
    }
    if (!passwordRegex.test(newPassword)) {
      return { status:400, message: "Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one symbol" };
    }
    try {
      const response = await fetch('http://localhost:8080/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'uuid': this.apiKey
        },
        body: JSON.stringify({ newEmail, newPassword }),
      });
      const data = await response.json();

      return { status: response.status, message: data.message };

    } catch (error) {
      console.error('Error during fetch operation:', error.message);
      return { status:500,message: 'An error occurred while connecting to the database' };
    }
  }

  async checkPassword(emailAttempt, passwordAttempt) {
    try {
      if (emailAttempt === '' || passwordAttempt === '') {
        return { status:400, message: "Email and Password cannot be empty" };
      }

      const response = await fetch('http://localhost:8080/check-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'uuid': this.apiKey
        },
        body: JSON.stringify({ emailAttempt, passwordAttempt }),
      });

      const data = await response.json();
      return { status: response.status, message: data.message }; 

    } catch (error) {
      console.error('Error during fetch operation:', error.message);
      return { status:r00, message: 'An error occurred while connecting to the database' };
    }
  }
}

module.exports = ZKAuth;
