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
    else{
      alert(data.logs)
    }
  } catch (error) {
    console.error('Error:', error);
  }
});