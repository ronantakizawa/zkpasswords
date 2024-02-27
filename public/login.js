document.getElementById('bCheckProof').addEventListener('click', async () => {
  const emailAttempt = document.getElementById('emailAttempt').value;
  const passwordAttempt = document.getElementById('passwordAttempt').value;

  try {
    const response = await fetch('http://localhost:3000/check-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailAttempt,passwordAttempt }),
    });

    const data = await response.json();
      alert(data.message)
  } catch (error) {
    console.error('Error:', error);
  }
});