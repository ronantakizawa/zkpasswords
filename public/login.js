document.getElementById('bCheckProof').addEventListener('click', async () => {
    const passwordAttempt = document.getElementById('passwordAttempt').value;
  
    try {
      const response = await fetch('/check-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passwordAttempt }),
      });
  
      const data = await response.json();
      // Display logs instead of just the message
      document.getElementById('output').textContent = data.logs;
    } catch (error) {
      console.error('Error:', error);
    }
  });