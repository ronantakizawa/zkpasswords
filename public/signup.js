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
    if(response.status !== 400){
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error:', error);
  }
});