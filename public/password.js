document.getElementById('setPassword').addEventListener('click', async () => {
    const newUsername = document.getElementById('usernameDefine').value;
    const newPassword = document.getElementById('passwordDefine').value;
    if (newPassword === '' || newUsername === '') {
        alert('Username and Password cannot be empty');
        return false;
    }

    if (newPassword.length > 20 || newUsername.length > 20) {
      alert('Username and Password cannot be longer than 20 characters');
      return false; 
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
      alert(data.message)
    } catch (error) {
      console.error('Error:', error);
    }
  });
  document.getElementById('bCheckProof').addEventListener('click', async () => {
    const usernameAttempt = document.getElementById('usernameAttempt').value;
    const passwordAttempt = document.getElementById('passwordAttempt').value;
    console.log(usernameAttempt);
    if (usernameAttempt === '' || passwordAttempt === '') {
        alert('Username and Password cannot be empty');
        return false;
    }

    if (usernameAttempt.length > 20 || passwordAttempt.length > 20) {
      alert('Username and Password cannot be longer than 20 characters');
      return false; 
    }
  
    try {
      const response = await fetch('http://localhost:8080/check-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernameAttempt,passwordAttempt }),
      });
  
      const data = await response.json();
      if(response.status === 404){
        alert("Invalid Username");
      }
      document.getElementById('output').textContent = data.logs;
    } catch (error) {
      console.error('Error:', error);
    }
  });