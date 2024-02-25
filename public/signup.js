document.getElementById('setPassword').addEventListener('click', async () => {
    const newPassword = document.getElementById('passwordDefine').value;
    if (newPassword === '') {
        alert('Password cannot be empty');
        return false;
    }
    if (newPassword.length > 20) {
      alert('Password cannot be longer than 20 characters');
      return false; // Prevent the form from being submitted
    }
  
    try {
      const response = await fetch('/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json();
      alert(data.message)
    } catch (error) {
      console.error('Error:', error);
    }
  });


  
  
  