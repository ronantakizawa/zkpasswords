document.getElementById('setPassword').addEventListener('click', async () => {
  const newEmail = document.getElementById('emailDefine').value;
  const newPassword = document.getElementById('passwordDefine').value;
  
  try {
    const response = await fetch('http://localhost:3000/set-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newEmail, newPassword }),
    });
    const data = await response.json();
    alert(data.message)
    if(response.status === 200){
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error:', error);
  }
});